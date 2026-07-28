import { motion } from "motion/react";
import { Target, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-24 lg:py-32 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* Left Column: Written Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-10 sm:space-y-12"
          >
            <div className="space-y-4 sm:space-y-6">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-brand-primary block">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text dark:text-dark-text tracking-tight font-display leading-[1.15]">
                Heritage &amp; Progress
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-brand-muted font-normal leading-[1.65] max-w-2xl">
                Talibon is a testament to resilience and the bounty of the sea. As the Seafood Capital of Bohol, we bridge our rich history with a digital-first future.
              </p>
            </div>

            <div>
              <Link 
                to="/about/history"
                className="minimal-button-primary inline-flex"
              >
                Explore History <ArrowUpRight size={18} className="shrink-0" />
              </Link>
            </div>

            {/* Vision & Mission Information Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-8 sm:pt-10 border-t border-brand-border/60 dark:border-dark-border/60">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-text dark:text-dark-text">
                  <Eye size={16} className="text-brand-primary shrink-0" />
                  <span>Vision</span>
                </div>
                <p className="text-sm sm:text-base text-brand-muted font-normal leading-[1.6]">
                  To be a premier center of commerce and eco-tourism in Northern Bohol.
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-text dark:text-dark-text">
                  <Target size={16} className="text-brand-primary shrink-0" />
                  <span>Mission</span>
                </div>
                <p className="text-sm sm:text-base text-brand-muted font-normal leading-[1.6]">
                  Empowering citizens through sustainable development and digital governance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Mayor Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative lg:pl-6 xl:pl-10"
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-brand-border/40 dark:border-dark-border/40 hover:-translate-y-1 transition-transform duration-500 bg-brand-surface/30">
              <img 
                src="https://talibon.gov.ph/wp-content/themes/yootheme/cache/28/MUNICIPAL-Mayoe2-28d8fb46.webp" 
                alt="Hon. Janette Aurestila-Garcia, Municipal Mayor of Talibon" 
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

