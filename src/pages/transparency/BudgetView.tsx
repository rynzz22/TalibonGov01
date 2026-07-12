import React from "react";

interface BudgetBreakdownItem {
  category: string;
  amount: string;
}

interface BudgetData {
  annualBudget: string;
  breakdown: BudgetBreakdownItem[];
}

interface BudgetViewProps {
  data: BudgetData;
}

export default function BudgetView({ data }: BudgetViewProps) {
  return (
    <div className="space-y-12">
      <div className="p-12 bg-brand-primary text-white rounded-[2.5rem] shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-80">Annual Budget</h3>
        <p className="text-6xl font-black tracking-tighter leading-none font-display uppercase">{String(data.annualBudget)}</p>
        <span className="absolute -bottom-8 -right-8 text-9xl font-black text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
          PHP
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(data.breakdown) && data.breakdown.map((item: BudgetBreakdownItem, idx: number) => (
          <div key={`${item.category}-${idx}`} className="civic-card p-8 group hover:-translate-y-1">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-2 group-hover:text-brand-primary transition-colors">{String(item.category)}</p>
            <p className="text-2xl font-black text-brand-text font-display uppercase">{String(item.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
