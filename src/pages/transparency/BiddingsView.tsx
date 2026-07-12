import React from "react";

interface BidItem {
  id: string;
  title: string;
  deadline: string;
}

interface BiddingsViewProps {
  data: BidItem[];
}

export default function BiddingsView({ data }: BiddingsViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(data) && data.map((bid: BidItem, idx: number) => (
        <div key={`${bid.id}-${idx}`} className="civic-card p-8 group">
          <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors mb-4 font-display uppercase tracking-tight">
            {String(bid.title)}
          </h3>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-full inline-block">
            DEADLINE: {String(bid.deadline)}
          </p>
        </div>
      ))}
    </div>
  );
}
