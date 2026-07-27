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
    <section className="py-24 bg-brand-bg" id="lgu-events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-4 py-1.5 rounded-full inline-block mb-3 tracking-[0.3em] uppercase">
              CALENDAR OF ACTIVITIES
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-brand-text uppercase tracking-tight font-display">
              LGU EVENTS & FESTIVITIES
            </h2>
            <p className="text-sm text-brand-muted font-medium max-w-xl mt-2">
              Upcoming municipal gatherings, cultural festivals, public hearings, and civic events in Talibon.
            </p>
          </div>

          <Link
            to="/tourism/festivities"
            className="px-6 py-3 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <span>View All Events</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-surface rounded-3xl border border-brand-border p-6 shadow-xl flex flex-col justify-between space-y-6 hover:border-amber-400/50 transition-all group"
            >
              <div className="space-y-4">
                <div className="aspect-[16/10] relative overflow-hidden rounded-2xl border border-brand-border/50">
                  <img
                    src={evt.banner_image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                    LGU EVENT
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-brand-text font-display tracking-tight leading-snug group-hover:text-amber-600 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-brand-muted font-normal leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-brand-border/60 text-xs font-semibold text-brand-text">
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Calendar size={14} className="text-amber-500 shrink-0" />
                    <span>{new Date(evt.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>

                  {evt.time && (
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Clock size={14} className="text-amber-500 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                  )}

                  {evt.venue && (
                    <div className="flex items-center gap-2 text-brand-muted">
                      <MapPin size={14} className="text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/tourism/festivities"
                className="pt-2 text-xs font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest inline-flex items-center gap-2 transition-colors"
              >
                <span>Event Details</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
