import React from "react";

interface Festivity {
  name: string;
  date: string;
  description: string;
}

interface FestivitiesViewProps {
  data: Festivity[];
}

export default function FestivitiesView({ data }: FestivitiesViewProps) {
  return (
    <div className="space-y-16">
      {Array.isArray(data) && data.map((fest: Festivity, idx: number) => (
        <div key={`${fest.name}-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center group">
          <div className="aspect-square bg-brand-surface rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
            <img 
              src={`https://picsum.photos/seed/${fest.name}/800/800`} 
              alt={fest.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] bg-brand-primary/10 px-4 py-2 rounded-full inline-block">
              {fest.date}
            </p>
            <h3 className="text-4xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight leading-none">
              {fest.name}
            </h3>
            <p className="text-lg text-brand-muted leading-relaxed font-medium">
              {fest?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
