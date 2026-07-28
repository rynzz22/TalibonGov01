import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, ArrowRight, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { EventItem } from "../services/cmsService";

export default function LguEventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await eventService.getEvents();
        setEvents(data.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching LGU Events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 bg-brand-bg" id="lgu-events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-brand-text uppercase tracking-tight font-display">
              LGU EVENTS & FESTIVITIES
            </h2>
            <p className="text-xs text-brand-muted font-medium max-w-lg mt-1">
              Upcoming municipal gatherings, cultural festivals, public hearings, and civic events in Talibon.
            </p>
          </div>

          <Link
            to="/tourism/festivities"
            className="px-3.5 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
          >
            <span>View All Events</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-surface rounded-xl sm:rounded-2xl border border-brand-border p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between space-y-2.5 sm:space-y-3 hover:border-amber-400/50 transition-all group"
            >
              <div className="space-y-2 sm:space-y-2.5">
                <div className="aspect-[16/9] max-h-36 sm:max-h-40 relative overflow-hidden rounded-lg sm:rounded-xl border border-brand-border/50">
                  <img
                    src={evt.banner_image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-brand-text font-display tracking-tight leading-snug group-hover:text-amber-600 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-[11px] text-brand-muted font-normal leading-normal line-clamp-2">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-1.5 space-y-1 border-t border-brand-border/60 text-[10px] sm:text-[11px] font-semibold text-brand-text">
                  <div className="flex items-center gap-1.5 text-brand-muted">
                    <Calendar size={12} className="text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{new Date(evt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>

                  {evt.time && (
                    <div className="flex items-center gap-1.5 text-brand-muted">
                      <Clock size={12} className="text-amber-500 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                  )}

                  {evt.venue && (
                    <div className="flex items-center gap-1.5 text-brand-muted">
                      <MapPin size={12} className="text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/tourism/festivities"
                className="pt-1 text-[10px] sm:text-[11px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Event Details</span>
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
