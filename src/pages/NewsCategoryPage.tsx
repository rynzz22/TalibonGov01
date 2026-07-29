import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Calendar, ArrowRight, Loader2, Search, Filter, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockAllowed } from '../lib/mode';
import DataUnavailableState from '../components/DataUnavailableState';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  image_url: string;
  file_url?: string;
  date: string;
}

const NewsCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryMap: Record<string, string> = {
    'articles': 'ARTICLE',
    'advisories': 'ADVISORY',
    'disaster': 'DISASTER',
    'updates': 'UPDATE',
    'gallery': 'GALLERY',
    'community': 'COMMUNITY',
    'notices': 'NOTICE',
    'forms': 'FORM'
  };

  const displayTitle: Record<string, string> = {
    'articles': 'News Articles',
    'advisories': 'Public Advisories',
    'disaster': 'Disaster Preparedness',
    'updates': 'LGU Updates',
    'gallery': 'Photo Gallery',
    'community': 'Community News',
    'notices': 'Public Notices',
    'forms': 'Downloadable Forms'
  };

  const fetchNews = useCallback(async () => {
    const firestoreCategory = categoryMap[category || ''] || (category?.toUpperCase().replace(/-/g, ' ') || 'ARTICLE');

    setLoading(true);
    setHasError(false);

    if (!isSupabaseConfigured) {
      if (!isMockAllowed()) {
        setHasError(true);
        setNews([]);
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('category', firestoreCategory)
        .is('barangay_id', null)
        .order('date', { ascending: false });

      if (error) {
        console.warn("Error fetching news:", error);
        setHasError(true);
        setNews([]);
      } else {
        setNews((data as NewsItem[]) || []);
      }
    } catch (err) {
      console.warn("Exception fetching news:", err);
      setHasError(true);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('news-category-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchNews())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [category, fetchNews]);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGallery = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <AnimatePresence mode="popLayout">
        {filteredNews.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative aspect-[4/3] max-h-48 sm:max-h-56 bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-brand-border shadow-2xs hover:shadow-xl hover:shadow-brand-primary/10 transition-all"
          >
            <img
              src={item.image_url || `https://picsum.photos/seed/${item.id}/800/800`}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 sm:p-5">
              <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest mb-1">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight font-display">
                {item.title}
              </h3>
              <Link 
                to={`/news/view/${item.id}`}
                className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-white hover:text-brand-secondary transition-colors"
              >
                VIEW DETAILS <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-3 sm:space-y-4">
      <AnimatePresence mode="popLayout">
        {filteredNews.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: idx * 0.05 }}
            className="pro-card p-3.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:border-brand-primary/30"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors tracking-tight font-display">
                  {item.title}
                </h3>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-0.5">
                  Posted: {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to={`/news/view/${item.id}`}
                className="px-3.5 py-1.5 bg-brand-bg text-brand-muted rounded-lg font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-brand-border transition-all"
              >
                DETAILS
              </Link>
              <a 
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-button px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] sm:text-[10px]"
              >
                <Download size={13} />
                DOWNLOAD FORM
              </a>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderStandard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <AnimatePresence mode="popLayout">
        {filteredNews.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
            className="pro-card rounded-xl sm:rounded-2xl overflow-hidden flex flex-col hover:border-brand-primary/30"
          >
            <div className="aspect-[16/9] max-h-36 sm:max-h-44 relative overflow-hidden">
              <img
                src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-center shadow-md border border-brand-border">
                <p className="text-[8px] sm:text-[9px] font-bold text-brand-primary uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                </p>
                <p className="text-sm sm:text-base font-black text-brand-text leading-none">
                  {new Date(item.date).getDate()}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <h3 className="text-xs sm:text-sm font-bold text-brand-text mb-1.5 group-hover:text-brand-primary transition-colors line-clamp-2 font-display tracking-tight leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-brand-muted font-normal leading-normal line-clamp-2 mb-4">
                {item.summary}
              </p>
              
              <div className="mt-auto pt-2.5 border-t border-brand-bg flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                  <Calendar size={12} />
                  {new Date(item.date).getFullYear()}
                </div>
                <Link 
                  to={`/news/view/${item.id}`}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-brand-primary hover:gap-2.5 transition-all"
                >
                  READ MORE <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen bg-brand-bg">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  const isGallery = category === 'gallery';
  const isForms = category === 'forms';

  return (
    <div className="pb-8 sm:pb-12 min-h-screen bg-brand-bg relative overflow-hidden">
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
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-brand-secondary/5 rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3"
          >
            <div className="w-8 h-0.5 bg-brand-primary rounded-full" />
            <span className="text-[10px] sm:text-xs font-bold text-brand-primary uppercase tracking-[0.25em]">News & Media</span>
          </motion.div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight leading-none font-display">
              {displayTitle[category || ''] || 'News'}
            </h1>
            
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xs border border-brand-border">
              <div className="relative group w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-brand-bg border border-transparent rounded-xl py-1.5 sm:py-2 pl-9 pr-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/30 transition-all w-full md:w-52"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 text-[9px] sm:text-[10px] font-bold text-brand-muted uppercase tracking-widest border-l border-brand-border">
                <Filter size={12} />
                {filteredNews.length} Items
              </div>
            </div>
          </div>
        </div>

        {hasError ? (
          <DataUnavailableState
            title={`${displayTitle[category || ''] || 'Content'} Temporarily Unavailable`}
            message="We are currently unable to retrieve the latest updates from the municipal database. Please try again or check our official Facebook page."
            onRetry={fetchNews}
          />
        ) : filteredNews.length > 0 ? (
          isGallery ? renderGallery() : isForms ? renderForms() : renderStandard()
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-brand-border">
            {isGallery ? <ImageIcon className="mx-auto text-brand-border mb-4" size={48} /> : <Newspaper className="mx-auto text-brand-border mb-4" size={48} />}
            <h3 className="text-xl font-extrabold text-brand-text mb-1 font-display">No content found</h3>
            <p className="text-xs text-brand-muted font-medium">There are currently no published items in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCategoryPage;

