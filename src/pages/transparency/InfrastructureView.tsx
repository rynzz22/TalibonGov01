import React from "react";

interface Project {
  id: string;
  title: string;
  status: string;
  budget: string;
}

interface InfrastructureViewProps {
  data: Project[];
}

export default function InfrastructureView({ data }: InfrastructureViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(data) && data.map((project: Project, idx: number) => (
        <div key={`${project.id}-${idx}`} className="civic-card p-8 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
              {String(project.title)}
            </h3>
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {String(project.status)}
            </span>
          </div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
            BUDGET: <span className="text-brand-primary">{String(project.budget)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
