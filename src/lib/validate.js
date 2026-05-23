/**
 * iBID Input Validation & Sanitization
 * OWASP guidelines: schema-based, type checks, length limits, reject unexpected fields.
 */

// ── Sanitizers ──────────────────────────────────────────────

/**
 * Strip HTML tags and trim whitespace to prevent XSS injection.
 * @param {string} val
 * @returns {string}
 */
export function sanitizeText(val) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[<>"'&]/g, (c) => ({    // escape dangerous chars
      '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#x27;', '&': '&amp;',
    }[c]))
    .trim()
    .slice(0, 500);                   // hard length cap
}

/**
 * Sanitize a numeric input — returns a number or null.
 * @param {any} val
 * @param {number} min
 * @param {number} max
 */
export function sanitizeNumber(val, min = 0, max = 999_999_999) {
  const n = Number(val);
  if (!isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

// ── Validators ──────────────────────────────────────────────

/**
 * Validate an email address.
 * @param {string} email
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { ok: false, error: 'Email is required.' };
  const trimmed = email.trim();
  if (trimmed.length > 254) return { ok: false, error: 'Email is too long.' };
  // RFC 5322 simplified regex
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRe.test(trimmed)) return { ok: false, error: 'Enter a valid email address.' };
  return { ok: true };
}

/**
 * Validate a password.
 * @param {string} password
 * @returns {{ ok: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (!password) return { ok: false, error: 'Password is required.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  if (password.length > 128) return { ok: false, error: 'Password is too long.' };
  return { ok: true };
}

/**
 * Validate a display name.
 * @param {string} name
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') return { ok: false, error: 'Name is required.' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: 'Name must be at least 2 characters.' };
  if (trimmed.length > 80) return { ok: false, error: 'Name must be under 80 characters.' };
  // No special characters that could be used for injection
  if (/[<>"'&;]/.test(trimmed)) return { ok: false, error: 'Name contains invalid characters.' };
  return { ok: true };
}

/**
 * Validate a phone number (digits only, 7–15 chars per E.164).
 * @param {string} phone
 * @returns {{ ok: boolean, error?: string }}
 */
export function validatePhone(phone) {
  if (!phone) return { ok: true }; // optional
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return { ok: false, error: 'Phone number is too short.' };
  if (digits.length > 15) return { ok: false, error: 'Phone number is too long.' };
  return { ok: true };
}

/**
 * Validate a listing title.
 * @param {string} title
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateListingTitle(title) {
  if (!title || typeof title !== 'string') return { ok: false, error: 'Title is required.' };
  const trimmed = title.trim();
  if (trimmed.length < 3) return { ok: false, error: 'Title must be at least 3 characters.' };
  if (trimmed.length > 120) return { ok: false, error: 'Title must be under 120 characters.' };
  return { ok: true };
}

/**
 * Validate a bid amount.
 * @param {number|string} amount
 * @param {number} minBid
 * @param {string} symbol
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateBidAmount(amount, minBid, symbol = '') {
  const n = Number(amount);
  if (!amount || !isFinite(n)) return { ok: false, error: 'Enter a valid bid amount.' };
  if (n < minBid) return { ok: false, error: `Minimum bid is ${symbol}${minBid.toLocaleString()}.` };
  if (n > 100_000_000) return { ok: false, error: 'Bid amount exceeds the maximum limit.' };
  if (!Number.isInteger(n)) return { ok: false, error: 'Bid must be a whole number.' };
  return { ok: true };
}

/**
 * Validate a starting price.
 * @param {string|number} price
 * @returns {{ ok: boolean, error?: string }}
 */
export function validatePrice(price) {
  const n = Number(price);
  if (!price || !isFinite(n)) return { ok: false, error: 'Starting price is required.' };
  if (n < 1) return { ok: false, error: 'Price must be at least 1.' };
  if (n > 100_000_000) return { ok: false, error: 'Price exceeds the maximum allowed.' };
  return { ok: true };
}

// ── Rate Limiting (client-side debounce) ──────────────────

const _lastCallTime = {};

/**
 * Simple client-side rate limiter.
 * Returns false if called too frequently (within intervalMs).
 * Server-side rate limiting via Supabase RLS / Postgres policies handles the rest.
 * @param {string} key  Unique key per action (e.g. 'place_bid', 'register')
 * @param {number} intervalMs  Minimum ms between calls
 */
export function rateLimitCheck(key, intervalMs = 2000) {
  const now = Date.now();
  if (_lastCallTime[key] && now - _lastCallTime[key] < intervalMs) {
    return false; // rate limited
  }
  _lastCallTime[key] = now;
  return true;
}
