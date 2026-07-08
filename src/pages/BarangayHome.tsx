import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BARANGAYS } from "../constants/barangayConfig";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Tourism from "../components/Tourism";
import Location from "../components/Location";
import PopularServices from "../components/PopularServices";
import TransparencyGovernance from "../components/TransparencyGovernance";
import MunicipalOffices from "../components/MunicipalOffices";
import { motion } from "motion/react";

const BarangayHome: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const brgy = BARANGAYS.find((b) => b.slug === slug);

  useEffect(() => {
    if (brgy) {
      document.documentElement.style.setProperty("--primary", brgy.theme.primary);
      document.documentElement.style.setProperty("--secondary", brgy.theme.secondary);
      document.documentElement.style.setProperty("--accent", brgy.theme.accent);
      
      // Update title
      document.title = `${brgy.name} | Talibon, Bohol`;
    }

    return () => {
      // Reset to defaults on unmount
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
      document.documentElement.style.removeProperty("--accent");
      document.title = "Talibon | Official Gateway";
    };
  }, [brgy]);

  if (!brgy) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="barangay-site">
      {/* Barangay Banner / Hero Overlay */}
      <section className="relative z-50 pointer-events-none">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl backdrop-blur-md opacity-80 border border-white/20">
          Official {brgy.name} Portal
        </div>
      </section>

      {/* We reuse the main sections but they will now use the new CSS variables */}
      <Hero 
        overrideTitle={brgy.name} 
        overrideSubtitle={brgy.description}
      />
      
      <div className="bg-white dark:bg-dark-bg py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-8"
           >
             <div className="minimal-card p-12 text-center">
               <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-4 block">Barangay Captain</span>
               <h3 className="text-2xl font-black">{brgy.captain}</h3>
             </div>
             <div className="minimal-card p-12 text-center">
               <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-4 block">Population</span>
               <h3 className="text-2xl font-black">{brgy.population}</h3>
             </div>
             <div className="minimal-card p-12 text-center border-2 border-brand-primary/10">
               <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-4 block">Status</span>
               <h3 className="text-2xl font-black">Active Site</h3>
             </div>
           </motion.div>
        </div>
      </div>

      <PopularServices />
      <Services />
      <Tourism />
      <Location />
      <TransparencyGovernance />
    </main>
  );
};

export default BarangayHome;
