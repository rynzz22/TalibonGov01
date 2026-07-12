import React from "react";
import { AlertCircle, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonNoticeProps {
  serviceTitle: string;
}

export const ComingSoonNotice: React.FC<ComingSoonNoticeProps> = ({ serviceTitle }) => {
  return (
    <div className="p-8 bg-gradient-to-br from-brand-secondary/10 to-brand-primary/5 border-2 border-brand-secondary/20 rounded-[2.5rem] space-y-5 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300">
      {/* Decorative large icon in background */}
      <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-secondary transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
        <Calendar size={140} />
      </div>
      
      <div className="flex items-center gap-3 text-brand-primary relative z-10">
        <AlertCircle size={22} className="flex-shrink-0 animate-bounce" />
        <span className="text-xs font-black uppercase tracking-widest bg-brand-primary/10 px-3.5 py-1 rounded-full">
          E-Service Development Notice
        </span>
      </div>
      
      <h4 className="text-xl font-black text-brand-text font-display uppercase tracking-tight relative z-10">
        Online Processing Under Active Integration
      </h4>
      
      <p className="text-sm text-brand-muted font-semibold leading-relaxed relative z-10">
        The digital, automated submission system for <strong className="text-brand-text font-extrabold">"{serviceTitle}"</strong> is currently undergoing strict security auditing and system integration. 
      </p>

      <div className="p-5 bg-white/60 dark:bg-dark-surface/40 rounded-2xl border border-brand-border/60 backdrop-blur-sm relative z-10 space-y-3">
        <h5 className="text-[10px] font-black text-brand-text uppercase tracking-widest">
          Alternative Walk-In Instructions
        </h5>
        <ul className="space-y-2 text-xs font-medium text-brand-muted list-disc list-inside">
          <li>Download the relevant forms listed below (if available).</li>
          <li>Prepare all required documentation from the checklist on the left.</li>
          <li>Submit requirements to the responsible office during standard hours.</li>
        </ul>
      </div>

      <div className="pt-2">
        <Link
          to="/downloads"
          className="inline-flex items-center gap-2.5 text-xs font-extrabold text-brand-primary hover:text-brand-primary/80 uppercase tracking-widest group/link"
        >
          <span>Browse all printable municipal forms</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ComingSoonNotice;
