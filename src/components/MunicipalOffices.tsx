import { motion } from "motion/react";
import { Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MunicipalOffices() {
  const offices = [
    {
      title: "Office of the Municipal Mayor",
      officer: "Hon. Michael I. Doria",
      color: "bg-emerald-50 text-emerald-500",
      borderColor: "border-emerald-100",
      iconColor: "text-emerald-400",
      accentColor: "bg-emerald-500"
    },
    {
      title: "Municipal Planning & Development Coordinator",
      officer: "Elmer B. Magalona",
      color: "bg-blue-50 text-blue-500",
      borderColor: "border-blue-100",
      iconColor: "text-blue-400",
      accentColor: "bg-blue-500"
    },
    {
      title: "Office of the Municipal Local Civil Registrar",
      officer: "Juliet D. Lumbo-an",
      color: "bg-orange-50 text-orange-500",
      borderColor: "border-orange-100",
      iconColor: "text-orange-400",
      accentColor: "bg-orange-500"
    },
    {
      title: "Office of the Municipal Budget Officer",
      officer: "Rogelia L. Cellan",
      color: "bg-purple-50 text-purple-500",
      borderColor: "border-purple-100",
      iconColor: "text-purple-400",
      accentColor: "bg-purple-500"
    }
  ];

  return (
    <section id="offices" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-primary mb-4 block"
          >
            Abante Talibon!
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-extrabold text-brand-text tracking-tight mb-8 font-display uppercase"
          >
            Municipal Offices & Departments
          </motion.h2>
          
          {/* Decorative Underline from Image */}
          <div className="flex justify-center gap-1 mb-12">
            <div className="w-16 h-1.5 bg-emerald-500 rounded-full" />
            <div className="w-16 h-1.5 bg-blue-500 rounded-full" />
            <div className="w-16 h-1.5 bg-orange-500 rounded-full" />
            <div className="w-16 h-1.5 bg-purple-500 rounded-full" />
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-brand-muted font-medium text-lg max-w-2xl mx-auto mb-16"
          >
            Dedicated public servants committed to excellence and transparency in local governance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offices.map((office, idx) => (
            <motion.div
              key={office.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group flex flex-col h-full bg-white rounded-3xl border border-brand-border overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
            >
              {/* Top Colored Section with Icon */}
              <div className={`h-48 flex items-center justify-center ${office.color} transition-colors duration-500`}>
                <div className={`p-6 rounded-3xl bg-white/50 backdrop-blur-sm shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                  <Building2 size={48} className={office.iconColor} />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-brand-text mb-2 leading-tight font-display group-hover:text-brand-primary transition-colors">
                  {office.title}
                </h3>
                <p className="text-sm text-brand-muted font-medium mb-6">
                  {office.officer}
                </p>
                
                <div className="mt-auto pt-6 border-t border-brand-border flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${office.borderColor.replace('border-', 'text-')}`}>
                    Department Head
                  </span>
                  <div className={`w-8 h-8 rounded-full ${office.accentColor} flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0`}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link 
            to="/executive/directory"
            className="minimal-button-outline inline-flex"
          >
            View All Offices & Departments <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Background Text - Embossment */}
      <div className="absolute -bottom-12 left-0 text-[20vw] font-black text-brand-primary/[0.02] select-none pointer-events-none leading-none font-display tracking-tighter">
        TALIBON
      </div>
    </section>
  );
}
