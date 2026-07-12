import React from "react";
import { motion } from "motion/react";
import { User, Phone, ExternalLink, Building2 } from "lucide-react";

interface Department {
  name: string;
  officialName: string;
  description: string;
  logoUrl?: string;
  type: string;
  head?: string;
  contact?: string;
  serviceLink?: string;
}

interface DepartmentsViewProps {
  data: Department[];
}

export default function DepartmentsView({ data }: DepartmentsViewProps) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((dept: Department, idx: number) => {
            const isWide = idx === 0 || idx === 3;
            return (
              <motion.div 
                key={`${dept.name}-${idx}`} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative overflow-hidden bg-white border border-brand-border rounded-3xl p-8 hover:border-brand-primary transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 ${isWide ? 'md:col-span-2' : ''}`}
              >
                {/* Background Code Decor */}
                <div className="absolute top-4 right-4 font-mono text-[8px] opacity-10 group-hover:opacity-30 transition-opacity select-none pointer-events-none uppercase tracking-tighter text-right">
                  <div className="text-brand-primary">DEPT_ID: {idx.toString().padStart(3, '0')}</div>
                  <div>MUNICIPAL_CODE: 071221</div>
                  <div>COORD: 10.15N/124.33E</div>
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    {dept.logoUrl && (
                      <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-brand-border">
                        <img 
                          src={dept.logoUrl} 
                          alt="" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="px-3 py-1 bg-brand-primary/5 text-brand-primary text-[8px] font-black rounded-full border border-brand-primary/10 tracking-[0.2em] uppercase">
                      {dept.type}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight leading-none mb-3 group-hover:text-brand-primary transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-widest mb-6 border-l-2 border-brand-primary/20 pl-3">
                      {dept.officialName}
                    </p>
                    <p className="text-sm text-brand-muted leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-brand-border mt-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest block opacity-60">Director / Head</span>
                        <div className="flex items-center gap-2 text-xs font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                          <User size={12} className="shrink-0" />
                          <span className="truncate">{dept.head || "OIC"}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest block opacity-60">Operations</span>
                        <div className="flex items-center gap-2 text-xs font-black text-brand-text uppercase tracking-tight">
                          <Phone size={12} className="shrink-0 text-brand-primary" />
                          <span className="truncate">{dept.contact || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={dept.serviceLink || "/about/services"}
                      className="mt-6 w-full flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-4 bg-gray-50 group-hover:bg-brand-text group-hover:text-white rounded-2xl transition-all"
                    >
                      ACCESS SERVICES <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Large Background Icon */}
                <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none select-none">
                  <Building2 size={200} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
            No departments found in technical database.
          </div>
        )}
      </div>
    </div>
  );
}
