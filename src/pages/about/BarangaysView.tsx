import React from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowUpRight } from "lucide-react";

interface Barangay {
  slug: string;
  name: string;
  captain: string;
}

interface BarangaysViewProps {
  data: Barangay[];
}

export default function BarangaysView({ data }: BarangaysViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((brgy: Barangay, idx: number) => (
          <Link 
            key={`${brgy.slug}-${idx}`} 
            to={`/brgy/${brgy.slug}`}
            className="minimal-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-brand-primary/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-text group-hover:text-brand-primary transition-colors">{brgy.name}</h3>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1">Captain: {brgy.captain}</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
              Visit Microsite <ArrowUpRight size={12} />
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
          No barangays found.
        </div>
      )}
    </div>
  );
}
