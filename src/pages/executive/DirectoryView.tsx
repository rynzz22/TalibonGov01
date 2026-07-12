import React from "react";

interface DirectoryEntry {
  department: string;
  contact: string;
}

interface DirectoryViewProps {
  data: DirectoryEntry[];
}

export default function DirectoryView({ data }: DirectoryViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((dept: DirectoryEntry, idx: number) => (
          <div key={`${dept.department}-${idx}`} className="flex justify-between items-center p-6 civic-card group">
            <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              {dept.department}
            </h3>
            <p className="text-lg font-bold text-brand-primary">{dept.contact}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
          No directory entries found.
        </div>
      )}
    </div>
  );
}
