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
        <div key={`${bid.id}-${idx}`} className="civic-card p-4 sm:p-5 group space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display tracking-tight">
            {String(bid.title)}
          </h3>
          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            DEADLINE: {String(bid.deadline)}
          </p>
        </div>
      ))}
    </div>
  );
}
