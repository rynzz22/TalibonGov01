import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, RefreshCw, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { newsService } from "../services/newsService";
import { NewsItem } from "../services/cmsService";

export default function OrtsUpdatesSection() {
  const [ortsItems, setOrtsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrts() {
      try {
        const allNews = await newsService.getNews();
        const filtered = allNews.filter((item) => {
          const cat = (item.category || "").toUpperCase();
          const title = (item.title || "").toUpperCase();
          return cat === "UPDATE" || cat.includes("ORTS") || title.includes("ORTS");
        });
        setOrtsItems(filtered.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching ORTS Updates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrts();
  }, []);

  if (loading) return null;
  if (ortsItems.length === 0) return null;

  return (
    <section className="py-24 bg-brand-surface border-t border-brand-border/40" id="orts-updates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block mb-3 tracking-[0.3em] uppercase">
              MUNICIPAL OPERATIONS & REFORMS
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-brand-text uppercase tracking-tight font-display">
              ORTS UPDATES
            </h2>
            <p className="text-sm text-brand-muted font-medium max-w-xl mt-2">
              Operational reforms, tracking progress, administrative circulars, and departmental updates from Talibon LGU.
            </p>
          </div>

          <Link
            to="/news/updates"
            className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <span>View All Updates</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ortsItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-bg rounded-3xl border border-brand-border p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300">
                    <Tag size={10} />
                    {item.category || "ORTS Update"}
                  </span>
                  <span className="text-brand-muted flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-brand-text font-display tracking-tight leading-snug group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-brand-muted font-normal leading-relaxed line-clamp-3">
                  {item.summary || item.content}
                </p>
              </div>

              <Link
                to={`/news/view/${item.id}`}
                className="pt-3 border-t border-brand-border/60 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest inline-flex items-center gap-2 transition-all group-hover:gap-3"
              >
                <span>Read Full Update</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
