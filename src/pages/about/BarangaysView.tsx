import React, { useState } from "react";
import { motion } from "motion/react";
import { Building2, Search, User, Phone, MapPin, Clock, Users } from "lucide-react";

interface Barangay {
  id: string;
  name: string;
  captain: string | null;
  population: number;
  contact_number?: string | null;
  office_address?: string | null;
  office_hours?: string | null;
  cover_image?: string | null;
}

interface BarangaysViewProps {
  data: Barangay[];
}

export default function BarangaysView({ data }: BarangaysViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBarangays = (Array.isArray(data) ? data : []).filter((brgy) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = brgy.name?.toLowerCase().includes(term);
    const captainMatch = brgy.captain?.toLowerCase().includes(term);
    return nameMatch || captainMatch;
  });

  return (
    <div className="space-y-12">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-brand-surface/30 p-8 rounded-3xl border border-brand-border/40 backdrop-blur-xs">
        <div className="text-left">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-text">Barangay Directory Search</h2>
          <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wider mt-1">
            Filter through Talibon's {data?.length || 25} official communities
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input
            type="text"
            placeholder="Search by Barangay or Captain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-dark-bg border border-brand-border/60 hover:border-brand-primary/40 focus:border-brand-primary/80 focus:ring-2 focus:ring-brand-primary/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-brand-text outline-none transition-all placeholder:text-brand-muted/70 placeholder:font-bold"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBarangays.length > 0 ? (
          filteredBarangays.map((brgy: Barangay, idx: number) => (
            <motion.div
              key={brgy.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
              className="group relative bg-brand-surface rounded-[2.5rem] border border-brand-border hover:border-brand-primary/30 hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col justify-between"
            >
              {/* Optional Cover Image or Decorative Top Accent */}
              {brgy.cover_image ? (
                <div className="h-32 w-full overflow-hidden relative border-b border-brand-border/40">
                  <img
                    src={brgy.cover_image}
                    alt={brgy.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/90 to-transparent" />
                </div>
              ) : (
                <div className="h-3 w-full bg-brand-primary/10 group-hover:bg-brand-primary transition-colors duration-500" />
              )}

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                      <Building2 size={20} />
                    </div>
                    {brgy.population > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 text-brand-primary rounded-full text-[9px] font-mono uppercase tracking-wider">
                        <Users size={12} /> {brgy.population.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-brand-text group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                    {brgy.name}
                  </h3>
                  <div className="w-8 h-1 bg-brand-primary/20 group-hover:w-16 transition-all duration-500 rounded-full mt-2" />
                </div>

                {/* Info Fields */}
                <div className="space-y-4 pt-4 border-t border-brand-border/50 text-left">
                  {/* Barangay Captain */}
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg text-brand-muted">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-brand-muted leading-none">Barangay Captain</p>
                      <p className="text-xs font-bold text-brand-text mt-0.5">{brgy.captain || "Not Specified"}</p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg text-brand-muted">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-brand-muted leading-none">Office Hours</p>
                      <p className="text-xs font-bold text-brand-text mt-0.5">{brgy.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM"}</p>
                    </div>
                  </div>

                  {/* Contact Number */}
                  {brgy.contact_number && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg text-brand-muted">
                        <Phone size={14} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-brand-muted leading-none">Contact Number</p>
                        <p className="text-xs font-bold text-brand-text mt-0.5">{brgy.contact_number}</p>
                      </div>
                    </div>
                  )}

                  {/* Office Address */}
                  {brgy.office_address && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg text-brand-muted mt-0.5">
                        <MapPin size={14} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-brand-muted leading-none">Office Address</p>
                        <p className="text-xs font-semibold text-brand-muted mt-0.5 leading-relaxed">{brgy.office_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-brand-surface/20 rounded-3xl border border-dashed border-brand-border/60">
            <p className="text-sm font-black uppercase tracking-widest text-brand-muted">No barangays match your search</p>
            <p className="text-[10px] font-mono text-brand-muted/70 uppercase tracking-wider mt-2">Try a different name or spelling</p>
          </div>
        )}
      </div>
    </div>
  );
}
