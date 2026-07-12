import React from "react";

interface VicinityData {
  url: string;
  title: string;
  description: string;
}

interface VicinityViewProps {
  data: VicinityData;
}

export default function VicinityView({ data }: VicinityViewProps) {
  return (
    <div className="space-y-8">
      <div className="aspect-video bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
        <img src={data.url} alt={data.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      </div>
      <p className="text-lg text-brand-muted leading-relaxed font-medium">{data?.description}</p>
    </div>
  );
}
