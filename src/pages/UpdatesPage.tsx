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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-brand-primary text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-none font-display uppercase">Municipal News Feed</h1>
          <p className="text-white/80 font-medium text-xs max-w-md">
            The official digital bulletin board for the Municipality of Talibon.
          </p>
        </div>
        <Facebook size={90} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
      </div>

      {/* Feed Selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(['pio', 'main'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFeed(key)}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
              activeFeed === key 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-102' 
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            {feeds[key].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2">
          <motion.div
            key={activeFeed}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-lg shadow-black/5 p-3 sm:p-4 overflow-hidden"
          >
            <div className="w-full">
              <iframe 
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(feeds[activeFeed].url)}&tabs=timeline&width=800&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                width="100%" 
                height="700" 
                style={{ border: 'none', overflow: 'hidden', borderRadius: '1rem' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title={`Talibon Facebook Feed - ${feeds[activeFeed].name}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 bg-brand-surface rounded-xl sm:rounded-2xl border border-brand-border space-y-3">
            <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.25em]">Source Info</h3>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary text-xs font-black shadow-2xs border border-brand-border shrink-0">
                 {activeFeed === 'pio' ? 'PIO' : 'LGU'}
               </div>
               <div>
                  <p className="text-xs sm:text-sm font-bold text-brand-text leading-tight">{feeds[activeFeed].name}</p>
                  <p className="text-[9px] text-brand-muted font-bold font-mono uppercase tracking-tighter mt-0.5">{feeds[activeFeed].handle}</p>
               </div>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed font-normal">
              You are currently viewing the live feed for <span className="text-brand-text font-bold">{feeds[activeFeed].name}</span>. 
              This stream is updated in real-time as new content is posted to Facebook.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-orange-50/80 rounded-xl sm:rounded-2xl border border-orange-100 space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <ShieldAlert size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Anti-Fake News</h3>
            </div>
            <p className="text-[11px] text-orange-700 leading-normal font-normal">
              Only trust information from our official Facebook pages. Do not share unverified reports during disasters or emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
