import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, MapPin, Users, User } from "lucide-react";
import { INITIAL_BARANGAYS } from "../services/cmsService";

const BarangaySelector: React.FC = () => {
  // Show 6 representative barangays
  const previewBarangays = INITIAL_BARANGAYS.slice(0, 6);

  return (
    <section className="py-32 bg-brand-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
          <div className="max-w-2xl">
            <span className="section-label">Municipal Communities</span>
            <h2 className="section-title">Barangays of Talibon</h2>
            <p className="text-xl text-brand-muted font-medium">
              Explore the official profiles, leadership, and directories for each of Talibon's 25 local barangay units.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex -space-x-4">
              {INITIAL_BARANGAYS.slice(0, 8).map((b, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-brand-surface flex items-center justify-center text-brand-primary font-black text-xs shadow-sm">
                  {b.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {previewBarangays.map((brgy, idx) => (
            <motion.div
              key={brgy.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link 
                to="/about/barangays"
                className="group block relative p-12 bg-brand-surface rounded-[3rem] border border-brand-border hover:bg-white hover:shadow-2xl hover:border-brand-primary/30 transition-all duration-500 overflow-hidden text-left"
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                      <MapPin size={24} />
                    </div>
                    <ArrowUpRight className="text-brand-primary opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all" size={24} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-brand-text mb-2 group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                      {brgy.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-wider">
                      <User size={12} className="text-brand-primary/60" />
                      Captain: {brgy.captain || "Not Specified"}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-brand-border/50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary group-hover:underline">View Directory</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted flex items-center gap-1">
                      <Users size={12} /> {brgy.population.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/about/barangays" 
            className="minimal-button-outline inline-flex"
          >
            Explore All 25 Barangays <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BarangaySelector;
