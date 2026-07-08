import { motion } from "motion/react";
import { Quote, History, Target, Eye, ArrowUpRight, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section id="about" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl">
              <img 
                src="https://talibon.gov.ph/wp-content/themes/yootheme/cache/28/MUNICIPAL-Mayoe2-28d8fb46.webp" 
                alt="Hon. Janette Aurestila-Garcia" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Minimal Caption */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-brand-text font-display uppercase tracking-tight">Hon. Janette Aurestila-Garcia</h3>
              <p className="text-brand-primary font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Municipal Mayor</p>
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">Heritage & Progress</h2>
              <p className="text-xl text-brand-muted font-medium leading-relaxed">
                Talibon is a testament to resilience and the bounty of the sea. As the Seafood Capital of Bohol, we bridge our rich history with a digital-first future.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: "VISION", 
                  desc: "To be a premier center of commerce and eco-tourism in Northern Bohol.",
                  icon: Eye,
                },
                { 
                  title: "MISSION", 
                  desc: "Empowering citizens through sustainable development and digital governance.",
                  icon: Target,
                }
              ].map((item) => (
                <div key={item.title} className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center text-brand-primary">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xs font-bold text-brand-text tracking-[0.2em] uppercase">{item.title}</h3>
                  <p className="text-brand-muted text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-12 border-t border-brand-border">
              <Link 
                to="/about/history"
                className="minimal-button-primary inline-flex"
              >
                Explore History <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

