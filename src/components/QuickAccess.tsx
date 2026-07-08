import { motion } from "motion/react";
import { 
  FileText, 
  FileCheck, 
  CreditCard, 
  Search, 
  Map, 
  Download, 
  BookOpen 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickAccess() {
  const quickLinks = [
    { name: "Apply for Permit", icon: FileText, href: "/forms/business" },
    { name: "Request Certificate", icon: FileCheck, href: "/executive/directory" },
    { name: "Pay Online", icon: CreditCard, href: "https://talibon-citizen-stg.multisyscorp.io/e-services" },
    { name: "Track My Request", icon: Search, href: "https://talibon-citizen-stg.multisyscorp.io/e-services" },
    { name: "Tourism Guide", icon: Map, href: "/tourism/spots" },
    { name: "Downloadables", icon: Download, href: "/downloads" },
    { name: "Citizen's Charter", icon: BookOpen, href: "/transparency/charter" },
  ];

  return (
    <section className="py-12 bg-brand-surface border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={link.href}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-brand-border flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-brand-primary/20">
                  <link.icon size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted group-hover:text-brand-primary transition-colors">
                  {link.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
