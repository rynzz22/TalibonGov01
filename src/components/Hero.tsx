import React from 'react';
import { motion } from "motion/react";
import { ArrowRight, Play, Globe, Shield, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../contexts/LanguageContext";

interface HeroProps {
  overrideTitle?: string;
  overrideSubtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ overrideTitle, overrideSubtitle }) => {
  const { t, language } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-start pt-[155px] lg:pt-[230px] pb-24 sm:pb-32 lg:pb-36 px-0">
      {/* Background Image / Video Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="http://talibon.gov.ph/wp-content/uploads/2025/11/AQNfA76VxqBsdOkCQGUI91qEDtBLVfxVALb-H9LBY6HdxHPZYsDhTPqmq4uncItBA1u5CUFmq7KAQA3usI2om9XI_dJCwqeJLyINzeVU7fug1A.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-10 w-full text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mt-0 mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-6xl font-black text-white leading-none tracking-tighter">
              #TALIBOOM!
            </h2>
            <div className="px-4 py-1.5 bg-brand-secondary text-white text-[10px] sm:text-xs font-black rounded-full rotate-3 animate-pulse shadow-lg">OFFICIAL</div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] lg:leading-[0.85] tracking-tighter mb-6 sm:mb-8 max-w-full lg:max-w-[55%]">
            {overrideTitle || (
              <>
                {language === 'en' ? (
                  <>
                    Bohol's <br />
                    Seafood <br />
                    Capital.
                  </>
                ) : (
                  <>
                    Kaulohan <br />
                    sa Isda <br />
                    sa Bohol.
                  </>
                )}
              </>
            )}
          </h1>
          
          <div className="py-1.5 px-3 bg-[#ffb703] inline-block mb-8 sm:mb-10">
            <p className="text-black text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase">
              {overrideSubtitle || (language === 'en' ? "Experience Bohol's Premier Destination in the Philippines" : "Masinati ang Kinamaayohang Destinasyon sa Bohol sa Pilipinas")}
            </p>
          </div>

          {/* CTA Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-6 sm:mb-8">
            <a 
              href="https://talibon-citizen-stg.multisyscorp.io/e-services"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 h-14 bg-[#00a852] text-white font-black text-xs tracking-[0.2em] rounded-2xl hover:bg-[#008c44] transition-all flex items-center justify-center gap-3 uppercase shadow-2xl hover:scale-105 active:scale-95"
            >
              <ArrowRight size={18} className="stroke-[3]" /> eGovSuite Portal
            </a>
            
            <Link 
              to="/about/profile"
              className="w-full sm:w-auto px-8 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-xs tracking-[0.2em] rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 uppercase shadow-xl hover:scale-105 active:scale-95"
            >
              <Smartphone size={18} className="stroke-[3]" /> Municipal Profile
            </Link>
          </div>

          {/* Standardized Pill Tags */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            {[
              { name: 'Permit', path: '/forms/business' },
              { name: 'Charter', path: '/transparency/charter' },
              { name: 'IMS', path: '/executive/gad-ims' },
              { name: 'News', path: '/news/articles' }
            ].map((item) => (
              <Link 
                key={item.name}
                to={item.path} 
                className="h-10 px-6 bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/20 hover:border-white/30 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:-translate-y-0.5 shadow-lg flex items-center justify-center"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

