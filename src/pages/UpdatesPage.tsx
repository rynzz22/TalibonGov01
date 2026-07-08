import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Info, ShieldAlert } from 'lucide-react';

const UpdatesPage: React.FC = () => {
  const [activeFeed, setActiveFeed] = React.useState<'pio' | 'main'>('pio');
  
  const feeds = {
    pio: {
      name: "Public Info Office",
      url: "https://www.facebook.com/PioTalibon",
      handle: "@PioTalibon"
    },
    main: {
      name: "Official LGU Page",
      url: "https://www.facebook.com/TalibonOfficialPage",
      handle: "@TalibonOfficialPage"
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-brand-primary text-white p-12 rounded-[3xl] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
            <Facebook size={12} /> Live Social Wall
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none font-display uppercase">Municipal News Feed</h1>
          <p className="text-white/70 font-medium text-lg max-w-md">
            The official digital bulletin board for the Municipality of Talibon.
          </p>
        </div>
        <Facebook size={160} className="absolute -right-12 -bottom-12 opacity-10 rotate-12" />
      </div>

      {/* Feed Selector */}
      <div className="flex flex-wrap gap-4 justify-center">
        {(['pio', 'main'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFeed(key)}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeFeed === key 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105' 
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            {feeds[key].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            key={activeFeed}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-brand-border shadow-2xl shadow-black/5 p-4 overflow-hidden"
          >
            <div className="w-full">
              <iframe 
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(feeds[activeFeed].url)}&tabs=timeline&width=800&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                width="100%" 
                height="800" 
                style={{ border: 'none', overflow: 'hidden', borderRadius: '1.5rem' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title={`Talibon Facebook Feed - ${feeds[activeFeed].name}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-brand-surface rounded-[2rem] border border-brand-border">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-6">Source Info</h3>
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-primary font-black shadow-sm border border-brand-border">
                 {activeFeed === 'pio' ? 'PIO' : 'LGU'}
               </div>
               <div>
                  <p className="text-sm font-bold text-brand-text leading-tight">{feeds[activeFeed].name}</p>
                  <p className="text-[10px] text-brand-muted font-bold font-mono uppercase tracking-tighter mt-1">{feeds[activeFeed].handle}</p>
               </div>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed font-medium">
              You are currently viewing the live feed for <span className="text-brand-text font-bold">{feeds[activeFeed].name}</span>. 
              This stream is updated in real-time as new content is posted to Facebook.
            </p>
          </div>

          <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
            <ShieldAlert className="text-orange-600 mb-4" size={32} />
            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Anti-Fake News</h3>
            <p className="text-xs text-orange-700 leading-relaxed font-medium">
              Only trust information from our official Facebook pages. Do not share unverified reports during disasters or emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
