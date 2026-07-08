import React from "react";
import { BARANGAYS } from "../constants/barangayConfig";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";

const BarangaySelector: React.FC = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
          <div className="max-w-2xl">
            <span className="section-label">Communities</span>
            <h2 className="section-title">Barangay Microsites</h2>
            <p className="text-xl text-brand-muted font-medium">
              Access dedicated digital portals for each of Talibon's 25 barangays. Each site provides localized news, services, and official updates.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="flex -space-x-4">
                {BARANGAYS.map((b, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-brand-surface flex items-center justify-center text-brand-primary font-black text-xs">
                    {b.name.charAt(b.name.length - 1)}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BARANGAYS.slice(0, 6).map((brgy, idx) => (
            <motion.div
              key={brgy.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link 
                to={`/brgy/${brgy.slug}`}
                className="group block relative p-12 bg-brand-surface rounded-[3rem] border border-brand-border hover:bg-white hover:shadow-2xl hover:border-brand-primary transition-all duration-500 overflow-hidden"
                style={{ '--brgy-primary': brgy.theme.primary } as any}
              >
                {/* Visual Accent */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"
                  style={{ backgroundColor: brgy.theme.primary, borderRadius: '0 0 0 100%' }}
                />

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
                    <p className="text-sm font-medium text-brand-muted leading-relaxed">
                      {brgy.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-brand-border/50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Official Portal</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Population: {brgy.population}</span>
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
