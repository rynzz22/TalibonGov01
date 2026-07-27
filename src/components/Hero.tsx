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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs sm:text-sm font-black rounded-full uppercase tracking-widest shadow-lg mb-6 border border-white/20">
              <Globe size={14} className="text-amber-300" />
              <span>Home of the Most Illustrious Son of Bohol</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter">
                #TALIBOOM!
              </h2>
              <div className="px-3 py-1 bg-brand-secondary text-white text-[10px] sm:text-xs font-black rounded-full rotate-2 animate-pulse shadow-md">
                OFFICIAL
              </div>
            </div>
            
            {/* Primary Hero Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6 font-display">
              {overrideTitle || (
                <>
                  Seafood Terminal <br />
                  <span className="text-amber-400">& Eco-Agri Hub.</span>
                </>
              )}
            </h1>
            
            {/* Subtitle / Refined Description */}
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-2xl">
              <p className="text-white text-xs sm:text-sm font-semibold tracking-wide leading-relaxed">
                {overrideSubtitle || (
                  "Talibon stands as Bohol's premier center for seafood & fisheries, eco-agricultural development, and vibrant municipal tourism — committed to innovation, environmental stewardship, and citizen service."
                )}
              </p>
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-6">
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

          {/* Carlos P. Garcia + Talibon Flag Visual Composition */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 w-full"
          >
            <div className="bg-slate-900/80 backdrop-blur-2xl border-2 border-amber-400/30 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">MUNICIPAL HISTORICAL HERITAGE</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">Talibon Legacy Showcase</h3>
              </div>

              {/* Dual Visual Composition Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* LEFT: Carlos P. Garcia */}
                <div className="bg-black/40 rounded-2xl border border-white/10 p-3 flex flex-col items-center text-center space-y-3 group hover:border-amber-400/50 transition-all">
                  <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-lg relative bg-slate-800">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Carlos_P._Garcia.jpg/800px-Carlos_P._Garcia.jpg" 
                      alt="Pres. Carlos P. Garcia" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight font-display">Pres. Carlos P. Garcia</h4>
                    <p className="text-[9px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">8th Philippine President</p>
                    <p className="text-[9px] text-slate-300 font-medium leading-tight mt-1">Born in Talibon, Bohol</p>
                  </div>
                </div>

                {/* RIGHT: Talibon Flag & Seal */}
                <div className="bg-black/40 rounded-2xl border border-white/10 p-3 flex flex-col items-center text-center space-y-3 group hover:border-emerald-400/50 transition-all">
                  <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-emerald-400/40 shadow-lg relative bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 flex items-center justify-center p-2">
                    <img 
                      src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
                      alt="Talibon Municipal Flag & Seal" 
                      className="w-20 h-20 object-contain drop-shadow-xl group-hover:rotate-6 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight font-display">Municipal Flag & Seal</h4>
                    <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider mt-0.5">Official LGU Emblem</p>
                    <p className="text-[9px] text-slate-300 font-medium leading-tight mt-1">Symbol of Unity & Progress</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link 
                  to="/about/history" 
                  className="text-[10px] font-black text-amber-300 hover:text-white uppercase tracking-widest inline-flex items-center gap-1 transition-colors"
                >
                  Explore Municipal History <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

