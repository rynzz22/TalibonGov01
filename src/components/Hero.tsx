import React from 'react';
import { motion } from "motion/react";
import { ArrowRight, Globe, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../contexts/LanguageContext";

interface HeroProps {
  overrideTitle?: string;
  overrideSubtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ overrideTitle, overrideSubtitle }) => {
  const { t, language } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-center pt-[160px] lg:pt-[240px] pb-24 sm:pb-32 lg:pb-36 px-0">
      {/* Background Image / Video Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source 
            src="http://talibon.gov.ph/wp-content/uploads/2025/11/AQNfA76VxqBsdOkCQGUI91qEDtBLVfxVALb-H9LBY6HdxHPZYsDhTPqmq4uncItBA1u5CUFmq7KAQA3usI2om9XI_dJCwqeJLyINzeVU7fug1A.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 lg:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-10 w-full text-left my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-12 flex flex-col items-start"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2.5 text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 sm:mb-6">
              <Globe size={16} className="text-amber-400 shrink-0" />
              <span>Home of the Most Illustrious Son of Bohol</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tighter leading-none mb-3 sm:mb-4 uppercase">
              #TALIBOOM!
            </h2>
            
            {/* Primary Hero Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-[4.25rem] lg:text-[5.5rem] xl:text-[6.5rem] font-display font-black text-white leading-[0.95] tracking-tighter mb-6 sm:mb-8 uppercase">
              {overrideTitle || (
                <>
                  Seafood Terminal <br />
                  <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                    & Eco-Agri Hub.
                  </span>
                </>
              )}
            </h1>
            
            {/* Description Paragraph */}
            <p className="text-white/85 text-base sm:text-lg lg:text-xl font-normal leading-relaxed sm:leading-8 max-w-2xl mb-8 sm:mb-10">
              {overrideSubtitle || (
                "Talibon stands as Bohol's premier center for seafood & fisheries, eco-agricultural development, and vibrant municipal tourism — committed to innovation, environmental stewardship, and citizen service."
              )}
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8 sm:mb-10">
              <a 
                href="https://talibon-citizen-stg.multisyscorp.io/e-services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-gradient-to-r from-[#00a852] to-[#008c44] hover:from-[#00b85a] hover:to-[#00964a] text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <ArrowRight size={15} className="stroke-[2.5] shrink-0" />
                <span>eGovSuite Portal</span>
              </a>
              
              <Link 
                to="/about/profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <Smartphone size={15} className="stroke-[2] shrink-0" />
                <span>Municipal Profile</span>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="w-full max-w-3xl pt-6 border-t border-white/15">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {[
                  { name: 'Permit', path: '/forms/business' },
                  { name: 'Charter', path: '/transparency/charter' },
                  { name: 'IMS', path: '/executive/gad-ims' },
                  { name: 'News', path: '/news/articles' }
                ].map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path} 
                    className="inline-flex items-center justify-center px-4 py-1.5 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 text-white/90 hover:text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

