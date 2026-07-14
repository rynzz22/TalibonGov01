import React from "react";

interface Spot {
  id: string;
  name: string;
  description?: string;
  featured_image?: string;
}

interface SpotsViewProps {
  data: Spot[];
}

export default function SpotsView({ data }: SpotsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.isArray(data) && data.map((spot: Spot, idx: number) => (
        <div key={`${spot.id}-${idx}`} className="group">
          <div className="aspect-square bg-brand-surface rounded-[2.5rem] mb-6 overflow-hidden border-4 border-white shadow-2xl relative">
            <img 
              src={spot.featured_image || `https://picsum.photos/seed/spot${spot.id}/800/800`} 
              alt={spot.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <h3 className="text-2xl font-black text-brand-text mb-3 group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {String(spot.name)}
          </h3>
          <p className="text-brand-muted text-sm font-medium leading-relaxed">
            {String(spot?.description || "")}
          </p>
        </div>
      ))}
    </div>
  );
}
