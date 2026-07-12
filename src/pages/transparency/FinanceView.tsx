import React from "react";

interface Report {
  id: string;
  title: string;
  url: string;
}

interface FinanceViewProps {
  data: Report[];
}

export default function FinanceView({ data }: FinanceViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(data) && data.map((report: Report, idx: number) => (
        <a key={`${report.id}-${idx}`} href={report.url} className="flex items-center justify-between p-6 civic-card group hover:bg-brand-primary/5 transition-all duration-300">
          <span className="text-lg font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {String(report.title)}
          </span>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-full">
            VIEW REPORT
          </span>
        </a>
      ))}
    </div>
  );
}
