import React, { useEffect } from "react";
import { motion } from "motion/react";
import GadImsSystem from "../../components/GadImsSystem";

interface GadImsViewProps {
  data?: any;
}

export default function GadImsView({ data }: GadImsViewProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <span className="section-label">Executive Services</span>
            <h1 className="section-title">Talibon GAD-IMS</h1>
            <p className="text-sm text-brand-muted font-medium mt-2 max-w-3xl leading-relaxed">
              Gender and Development Integrated Management System — Mainstreaming gender-responsive governance, beneficiary profiling, and resource monitoring for the Municipality of Talibon.
            </p>
          </div>
          <GadImsSystem data={data} />
        </motion.div>
      </div>
    </div>
  );
}

