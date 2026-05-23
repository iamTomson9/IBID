import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function StaticPage({ slug }) {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('static_pages')
          .select('title, content')
          .eq('slug', slug)
          .single();
          
        if (error) throw error;
        if (data) setPageData(data);
      } catch (err) {
        console.error('Error loading static page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="page-header container">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
        <h1 className="heading-3">{pageData ? pageData.title : 'Loading...'}</h1>
        <div style={{ width: 24 }} />
      </header>

      <div className="container" style={{ marginTop: 'var(--space-md)' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading content...</p>
        ) : pageData ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            {pageData.content}
          </div>
        ) : (
          <p style={{ color: 'var(--danger)' }}>Page not found.</p>
        )}
      </div>
    </motion.div>
  );
}
