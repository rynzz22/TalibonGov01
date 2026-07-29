import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, MapPin, Users, User } from "lucide-react";
import { INITIAL_BARANGAYS } from "../services/cmsService";

const BarangaySelector: React.FC = () => {
  // Show 6 representative barangays
  const previewBarangays = INITIAL_BARANGAYS.slice(0, 6);

  return (
    <section className="py-12 sm:py-16 bg-brand-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <span className="section-label">Municipal Communities</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text font-display uppercase tracking-tight">Barangays of Talibon</h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1">
              Explore the official profiles, leadership, and directories for each of Talibon's 25 local barangay units.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex -space-x-2">
              {INITIAL_BARANGAYS.slice(0, 8).map((b, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-surface flex items-center justify-center text-brand-primary font-bold text-[10px] shadow-xs">
                  {b.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {previewBarangays.map((brgy, idx) => (
            <motion.div
              key={brgy.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Link 
                to="/about/barangays"
                className="group block relative p-4 sm:p-5 bg-white rounded-xl border border-brand-border hover:border-brand-primary/40 hover:shadow-md transition-all duration-300 overflow-hidden text-left"
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 bg-brand-primary/5 rounded-lg flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all border border-brand-primary/10">
                      <MapPin size={18} />
                    </div>
                    <ArrowUpRight className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all" size={18} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-brand-text mb-1 group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
                      {brgy.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                      <User size={12} className="text-brand-primary/70 shrink-0" />
                      <span className="truncate">Captain: {brgy.captain || "Not Specified"}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-brand-border/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary group-hover:underline">View Directory</span>
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-brand-muted flex items-center gap-1">
                      <Users size={11} /> {brgy.population.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/about/barangays" 
            className="minimal-button-outline inline-flex text-xs py-2.5 px-5"
          >
            Explore All 25 Barangays <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BarangaySelector;
