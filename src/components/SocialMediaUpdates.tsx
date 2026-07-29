import React from "react";
import { motion } from "motion/react";
import { Facebook, Instagram, MessageSquare, ShieldCheck, Flame, Camera, ExternalLink } from "lucide-react";
import { OFFICIAL_FACEBOOK_URLS } from "../constants";

export default function SocialMediaUpdates() {
  const channels = [
    { name: "Information Office", icon: MessageSquare, color: "bg-blue-500", url: OFFICIAL_FACEBOOK_URLS.PIO },
    { name: "Abante Talibon", icon: Facebook, color: "bg-brand-primary", url: OFFICIAL_FACEBOOK_URLS.MAIN },
    { name: "SK Federation", icon: Instagram, color: "bg-pink-500", url: OFFICIAL_FACEBOOK_URLS.PIO },
    { name: "PESO Talibon", icon: Facebook, color: "bg-blue-600", url: OFFICIAL_FACEBOOK_URLS.PIO },
    { name: "PNP Talibon", icon: ShieldCheck, color: "bg-slate-800", url: OFFICIAL_FACEBOOK_URLS.PIO },
    { name: "BFP Talibon", icon: Flame, color: "bg-orange-600", url: OFFICIAL_FACEBOOK_URLS.PIO },
    { name: "Tourism Office", icon: Camera, color: "bg-emerald-600", url: OFFICIAL_FACEBOOK_URLS.PIO },
  ];

  // Using lucide icons that match the context
  const getIcon = (name: string) => {
    if (name.includes("PNP")) return <ShieldCheck size={20} />;
    if (name.includes("BFP")) return <Flame size={20} />;
    if (name.includes("Tourism")) return <Camera size={20} />;
    if (name.includes("SK")) return <Instagram size={20} />;
    if (name.includes("Information")) return <MessageSquare size={20} />;
    return <Facebook size={20} />;
  };

  return (
    <section className="py-10 sm:py-14 bg-brand-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Channels */}
          <div>
            <span className="section-label">Stay Connected</span>
            <h2 className="section-title">Social Media Updates</h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed mb-6 max-w-lg">
              Stay informed with the latest announcements, events, and updates from Talibon through our official social media channels.
            </p>
            
            <div className="flex flex-wrap gap-2.5">
              {channels.map((channel, idx) => (
                <motion.a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-brand-border rounded-xl hover:border-brand-primary/40 hover:shadow-md transition-all group"
                >
                  <div className={`w-6 h-6 rounded-lg ${channel.color} flex items-center justify-center text-white transition-transform group-hover:rotate-12 shrink-0`}>
                    {React.cloneElement(getIcon(channel.name), { size: 14 })}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-brand-text uppercase tracking-widest">{channel.name}</span>
                  <ExternalLink size={10} className="text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Column: Latest Official Facebook Updates */}
          <div className="relative w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xl shadow-black/5 p-4 sm:p-6 overflow-hidden flex flex-col space-y-4"
            >
              {/* Container Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-brand-text uppercase tracking-tight font-display">
                    Latest Official Updates
                  </h3>
                  <p className="text-[10px] text-brand-muted font-semibold">
                    Official Municipal Announcement Stream
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 w-fit">
                  <Facebook size={12} className="text-blue-600 shrink-0" />
                  Official Facebook Page
                </span>
              </div>

              {/* Responsive Embed Container */}
              <div className="relative w-full overflow-hidden bg-slate-50 rounded-2xl border border-slate-100 min-h-[420px] max-h-[500px] flex flex-col items-center justify-center">
                <iframe 
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(OFFICIAL_FACEBOOK_URLS.PIO)}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                  width="100%" 
                  height="480" 
                  style={{ border: 'none', overflow: 'hidden', borderRadius: '0.75rem' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Talibon LGU Official Facebook Feed"
                  className="w-full h-[480px] max-w-full"
                />
              </div>

              {/* Footer Preview & External Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="text-[11px] text-brand-muted font-medium max-w-xs leading-normal">
                  Follow the official Facebook page for the latest municipal announcements, events, advisories, and community updates.
                </div>
                <a
                  href={OFFICIAL_FACEBOOK_URLS.PIO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-blue-600/20 active:scale-95 shrink-0 w-full sm:w-auto"
                >
                  <Facebook size={14} />
                  <span>View Latest Updates on Facebook</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
            
            {/* Background Accent Gradients */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

