import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OfficialSealPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sealUrl = "http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png";

  return (
    <div className="min-h-screen bg-white pb-24 flex flex-col items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-16">
          <span className="section-label">Symbolism</span>
          <h1 className="section-title">Official Seal</h1>
        </div>

        <div className="flex flex-col items-center justify-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", damping: 20 }}
            className="relative w-full max-w-2xl"
          >
            <div className="bg-brand-surface p-8 md:p-16 rounded-[4rem] border border-brand-border shadow-xl">
              <img 
                src={sealUrl} 
                alt="Official Seal of Talibon" 
                className="w-full h-auto max-w-[600px] mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
          
          <div className="max-w-2xl text-center">
            <p className="text-xl text-brand-muted font-medium leading-relaxed">
              The official seal of the Municipality of Talibon, Bohol, Philippines represents our rich history, our connection to the sea, and our commitment to progress and unity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialSealPage;
