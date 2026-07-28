import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Newspaper, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { newsService } from "../services/newsService";
import { NewsItem } from "../services/cmsService";

export default function NewsTodaySection() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await newsService.getNews();
        // Exclude pure advisories if desired, or show top published items
        const published = data.filter((item) => item.status === "published" || !item.status);
        setNewsList(published.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching News Today:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-8 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest animate-pulse">Loading News Today...</p>
        </div>
      </section>
    );
  }

  if (newsList.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 bg-brand-surface border-y border-brand-border/40" id="news-today">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-brand-text uppercase tracking-tight font-display">
              NEWS TODAY
            </h2>
            <p className="text-xs text-brand-muted font-medium max-w-lg mt-1">
              Official press releases, governance accomplishments, and community news from the Municipality of Talibon.
            </p>
          </div>

          <Link
            to="/news/articles"
            className="px-3.5 py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
          >
            <span>View All News</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {newsList.map((item, index) => (
             <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/news/view/${item.id}`} className="group block space-y-2 sm:space-y-2.5 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="aspect-[16/9] max-h-36 sm:max-h-40 relative overflow-hidden rounded-xl sm:rounded-2xl border border-brand-border bg-slate-100 shadow-2xs">
                    <img
                      src={item.image_url || "http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 text-[9px] font-bold text-brand-muted uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-brand-primary" />
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {item.author && (
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-brand-primary" />
                        {item.author}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display tracking-tight leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-brand-muted font-normal leading-normal line-clamp-2">
                    {item.summary || item.content}
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-black text-brand-primary uppercase tracking-widest group-hover:gap-2.5 transition-all">
                  <span>Read Article</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
