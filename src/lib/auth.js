/**
 * iBID Auth Service — Firebase Auth is the security layer.
 *
 * Flow:
 *   Register → createUserWithEmailAndPassword → navigate /verify
 *   Verify   → phone OTP (Firebase PhoneAuthProvider) OR email link
 *   Login    → signInWithEmailAndPassword → if !verified → /verify else /home
 *   Forgot   → sendPasswordResetEmail  OR  phone OTP → updatePassword
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification as fbSendEmailVerification,
  sendPasswordResetEmail as fbSendPasswordReset,
  PhoneAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  signInWithPhoneNumber,
  updatePassword,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { supabase } from './supabase';
import { sanitizeText, validateEmail, validatePassword, validateName } from './validate';

// ── Recaptcha (reused across calls) ──────────────────────────

let _recaptchaVerifier = null;
let _phoneConfirmResult = null; // stored for OTP confirm step

export function initRecaptcha(containerId = 'recaptcha-container') {
  // Always re-create if the container is missing or verifier is stale
  if (_recaptchaVerifier) {
    try {
      _recaptchaVerifier.render(); // throws if already rendered
    } catch (_) {
      // Already rendered — reuse it
    }
    return _recaptchaVerifier;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('recaptcha-container not found in DOM.');
  }

  _recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      _recaptchaVerifier = null;
      _phoneConfirmResult = null;
    },
  });
  return _recaptchaVerifier;
}

// ── Firebase → Supabase JWT Bridge ───────────────────────────

export async function injectFirebaseTokenToSupabase(firebaseUser) {
  if (!firebaseUser) return;
  try {
    const idToken = await firebaseUser.getIdToken(false);
    await supabase.auth.setSession({ access_token: idToken, refresh_token: idToken });
  } catch (err) {
    console.warn('Firebase→Supabase token injection failed:', err.message);
  }
}

// ── Sign Up ──────────────────────────────────────────────────

export async function signUp({ email, password, name, phone, country }) {
  const emailCheck = validateEmail(email);
  if (!emailCheck.ok) throw new Error(emailCheck.error);
  const passCheck = validatePassword(password);
  if (!passCheck.ok) throw new Error(passCheck.error);
  const nameCheck = validateName(name);
  if (!nameCheck.ok) throw new Error(nameCheck.error);

  const cleanName = sanitizeText(name);
  const cleanEmail = email.trim().toLowerCase();

  // 1. Firebase Auth — creates user, signs them in immediately
  const { user } = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
  await updateProfile(user, { displayName: cleanName });

  // 2. Inject token into Supabase
  await injectFirebaseTokenToSupabase(user);

  // 3. Create Supabase profile row (account_verified starts false)
  const { error } = await supabase.from('users').upsert([{
    id: user.uid,
    name: cleanName,
    email: cleanEmail,
    phone: phone || '',
    country: country || '',
    city: '',
    is_verified_seller: false,
    account_verified: false,
    phone_verified: false,
    bidder_score: 0,
    seller_score: 0,
    badge: 'bronze',
    total_deals: 0,
    products_bought: 0,
    products_sold: 0,
    is_flagged: false,
  }], { onConflict: 'id', ignoreDuplicates: true });

  if (error) console.warn('Profile insert warning:', error.message);

  return user;
}

// ── Sign In ──────────────────────────────────────────────────

export async function signIn({ email, password }) {
  const emailCheck = validateEmail(email);
  if (!emailCheck.ok) throw new Error(emailCheck.error);
  const passCheck = validatePassword(password);
  if (!passCheck.ok) throw new Error(passCheck.error);

  const { user } = await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim().toLowerCase(),
    password
  );
  await injectFirebaseTokenToSupabase(user);
  return user;
}

// ── Sign Out ─────────────────────────────────────────────────

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
  await supabase.auth.signOut();
}

// ── Auth State Listener ───────────────────────────────────────

export function onAuthChange(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

// ── Phone OTP ────────────────────────────────────────────────

/**
 * Send OTP to phone via Firebase Phone Auth.
 * Must call initRecaptcha() first (renders invisible recaptcha).
 */
export async function sendPhoneOTP(phoneNumber) {
  try {
    // Firebase requires strict E.164 format (e.g. +26771234567) without spaces or hyphens.
    // Strip everything except the leading '+' and digits.
    const hasPlus = phoneNumber.trim().startsWith('+');
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (hasPlus) cleanNumber = '+' + cleanNumber;

    const verifier = initRecaptcha();
    _phoneConfirmResult = await signInWithPhoneNumber(firebaseAuth, cleanNumber, verifier);
    return true;
  } catch (err) {
    _recaptchaVerifier = null; // reset on error so it can be recreated
    throw err;
  }
}

/**
 * Confirm the OTP code the user typed.
 * signInWithPhoneNumber can either:
 *   a) Sign in the phone as primary (if email user linked phone)
 *   b) Just verify without signing out current user
 * Either way we mark account_verified in Supabase for the email UID.
 */
export async function confirmPhoneOTP(code) {
  if (!_phoneConfirmResult) {
    throw new Error('No OTP session found. Please request a new code.');
  }

  // Store the current email-auth user's UID before confirm (it might change)
  const emailUid = firebaseAuth.currentUser?.uid;

  const result = await _phoneConfirmResult.confirm(code);

  // Determine which UID to mark verified
  // After confirm, the auth user might be the phone user or same email user
  const uid = emailUid || result.user?.uid || firebaseAuth.currentUser?.uid;

  if (uid) {
    await supabase
      .from('users')
      .update({ account_verified: true, phone_verified: true })
      .eq('id', uid);
  }

  _phoneConfirmResult = null; // clear after success
  return result;
}

/**
 * Resend OTP — resets verifier and sends again.
 */
export async function resendPhoneOTP(phoneNumber) {
  _recaptchaVerifier = null;
  _phoneConfirmResult = null;
  return sendPhoneOTP(phoneNumber);
}

// ── Email Verification ───────────────────────────────────────

/**
 * Send Firebase email verification link.
 */
export async function sendEmailVerificationLink() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not logged in.');
  
  // Use production domain for the redirect to avoid 'unauthorized-continue-uri'
  // errors when testing via local network IPs on mobile devices.
  const redirectUrl = window.location.hostname === 'localhost' 
    ? window.location.origin + '/home' 
    : 'https://ibid-app-123.web.app/home';

  await fbSendEmailVerification(user, {
    url: redirectUrl,
  });
}

/**
 * Reload Firebase user and check if email is verified.
 * If verified, marks account_verified in Supabase.
 */
export async function checkEmailVerified() {
  const user = firebaseAuth.currentUser;
  if (!user) return false;
  await user.reload();
  if (user.emailVerified) {
    const uid = user.uid;
    await supabase.from('users').update({ account_verified: true }).eq('id', uid);
    return true;
  }
  return false;
}

// ── Password Reset ───────────────────────────────────────────

/**
 * Send password reset email.
 */
export async function resetPasswordByEmail(email) {
  const emailCheck = validateEmail(email);
  if (!emailCheck.ok) throw new Error(emailCheck.error);
  await fbSendPasswordReset(firebaseAuth, email.trim().toLowerCase(), {
    url: window.location.origin + '/login',
  });
}

/**
 * Send OTP to phone for password reset identity verification.
 * (Same as sendPhoneOTP — just a conceptual alias)
 */
export async function sendPasswordResetOTP(phoneNumber) {
  return sendPhoneOTP(phoneNumber);
}

// ── Profile Fetch ─────────────────────────────────────────────

export async function fetchUserProfile(uid) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const firebaseUser = firebaseAuth.currentUser;
    const newProfile = {
      id: uid,
      name: sanitizeText(firebaseUser?.displayName || 'iBID User'),
      email: firebaseUser?.email || '',
      phone: '', country: '', city: '',
      is_verified_seller: false,
      account_verified: firebaseUser?.emailVerified || false,
      phone_verified: false,
      bidder_score: 0, seller_score: 0, badge: 'bronze',
      total_deals: 0, products_bought: 0, products_sold: 0, is_flagged: false,
    };
    await supabase.from('users').upsert([newProfile], { onConflict: 'id', ignoreDuplicates: true });
    return mapProfile(newProfile);
  }

  // Sync emailVerified from Firebase to Supabase if needed
  const firebaseUser = firebaseAuth.currentUser;
  if (firebaseUser?.emailVerified && !data.account_verified) {
    await supabase.from('users').update({ account_verified: true }).eq('id', uid);
    data.account_verified = true;
  }

  return mapProfile(data);
}

function mapProfile(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    country: data.country,
    city: data.city,
    avatar: data.avatar_url || null,
    isVerifiedSeller: data.is_verified_seller,
    accountVerified: data.account_verified || false,
    phoneVerified: data.phone_verified || false,
    bidderScore: data.bidder_score,
    sellerScore: data.seller_score,
    badge: data.badge || 'bronze',
    totalDeals: data.total_deals,
    productsBought: data.products_bought,
    productsSold: data.products_sold,
    memberSince: data.member_since,
    isFlagged: data.is_flagged,
    reviews: [],
  };
}
