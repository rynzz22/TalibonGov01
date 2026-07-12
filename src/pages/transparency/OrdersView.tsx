import React from "react";

interface Order {
  id: string;
  date: string;
  title: string;
}

interface OrdersViewProps {
  data: Order[];
}

export default function OrdersView({ data }: OrdersViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(data) && data.map((order: Order, idx: number) => (
        <div key={`${order.id}-${idx}`} className="civic-card p-8 group">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">
            {String(order.date)}
          </p>
          <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {String(order.title)}
          </h3>
        </div>
      ))}
    </div>
  );
}
