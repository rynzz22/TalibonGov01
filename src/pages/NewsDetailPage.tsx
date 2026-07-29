import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Loader2, Share2, Bookmark } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockAllowed } from '../lib/mode';
import DataUnavailableState from '../components/DataUnavailableState';

interface NewsItem {
  id: string;
  slug?: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  image_url: string;
  date: string;
  author?: string;
  status?: string;
}

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchItem = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setHasError(false);

    if (isSupabaseConfigured) {
      try {
        // Query 1: Direct select on news table by ID
        let fetchedNews: any = null;
        let { data: byId, error: errById } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!errById && byId) {
          fetchedNews = byId;
        } else {
          // Query 2: Try select on news table by slug
          let { data: bySlug, error: errBySlug } = await supabase
            .from('news')
            .select('*')
            .eq('slug', id)
            .maybeSingle();
          if (!errBySlug && bySlug) {
            fetchedNews = bySlug;
          } else if (errById && errBySlug) {
            setHasError(true);
            setLoading(false);
            return;
          }
        }

        if (fetchedNews) {
          let authorDisplay = fetchedNews.author || 'Talibon LGU';
          
          if (fetchedNews.author_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', fetchedNews.author_id)
                .maybeSingle();
              if (profile?.full_name) {
                authorDisplay = `${profile.full_name}${profile.role ? ` (${profile.role})` : ''}`;
              }
            } catch {
              // Ignore profile lookup error
            }
          }

          setItem({
            ...fetchedNews,
            author: authorDisplay
          } as NewsItem);
          setLoading(false);
          return;
        } else {
          // Record does not exist in DB
          setItem(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[NewsDetailPage] Supabase fetch error:", err);
        setHasError(true);
        setLoading(false);
        return;
      }
    }

    if (!isMockAllowed()) {
      setHasError(true);
      setItem(null);
      setLoading(false);
      return;
    }

    // Dev mode only fallback
    setItem(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen bg-brand-bg">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="pb-20 pt-8 px-4 max-w-4xl mx-auto min-h-screen bg-brand-bg">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors uppercase tracking-widest mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to News
        </button>
        <DataUnavailableState
          title="News Article Temporarily Unavailable"
          message="We couldn't retrieve this article from the municipal database right now. Please try again later or check our official Facebook page for announcements."
          onRetry={fetchItem}
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pb-20 pt-16 px-4 max-w-xl mx-auto min-h-screen text-center bg-brand-bg">
        <h1 className="text-3xl font-extrabold text-brand-text mb-3 font-display">News Article Not Found</h1>
        <p className="text-xs sm:text-sm text-brand-muted mb-6 font-medium leading-relaxed">
          The requested news article does not exist or may have been removed.
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="pro-button px-6 py-3 text-xs"
        >
          GO BACK
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Professional UI Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors uppercase tracking-widest mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to News
        </motion.button>

        <article className="pro-card overflow-hidden">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={item.image_url || `https://picsum.photos/seed/${item.id}/1200/800`}
              alt={item.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-text/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="px-4 py-1.5 bg-brand-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                {item.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
                {item.title}
              </h1>
            </div>
          </div>

          <div className="p-8 md:p-16">
            <div className="flex flex-wrap items-center gap-8 mb-12 pb-8 border-b border-brand-bg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Published On</p>
                  <p className="text-sm font-extrabold text-brand-text">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Author</p>
                  <p className="text-sm font-extrabold text-brand-text">{item.author || 'Talibon LGU'}</p>
                </div>
              </div>
              <div className="ml-auto flex gap-3">
                <button className="w-12 h-12 bg-brand-bg text-brand-muted rounded-2xl flex items-center justify-center hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                  <Share2 size={20} />
                </button>
                <button className="w-12 h-12 bg-brand-bg text-brand-muted rounded-2xl flex items-center justify-center hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-brand-muted font-medium leading-relaxed mb-12 italic border-l-4 border-brand-primary pl-6">
                {item.summary}
              </p>
              <div className="text-brand-text leading-relaxed font-medium whitespace-pre-line text-lg">
                {item.content}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;
