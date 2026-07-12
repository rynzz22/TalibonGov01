import { motion } from "motion/react";
import { 
  FileText, 
  CreditCard, 
  Users, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  ArrowUpRight, 
  Sprout, 
  ShieldCheck,
  Smartphone,
  Globe,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Services() {
  const services = [
    {
      icon: FileText,
      title: "Business Permits",
      description: "Apply or renew your business permits online with our streamlined process.",
      href: "/forms/business",
      className: "md:col-span-2 md:row-span-2 bg-brand-primary text-white",
      iconColor: "text-white"
    },
    {
      icon: CreditCard,
      title: "Real Property Tax",
      description: "Pay your RPT online and avoid long queues.",
      href: "/transparency/finance",
      className: "md:col-span-1 md:row-span-1 bg-brand-surface",
      iconColor: "text-brand-accent"
    },
    {
      icon: Users,
      title: "Civil Registry",
      description: "Request birth, marriage, and death certificates.",
      href: "/executive/directory",
      className: "md:col-span-1 md:row-span-1 bg-brand-surface",
      iconColor: "text-brand-secondary"
    },
    {
      icon: Building2,
      title: "Building Permits",
      description: "Apply for building permits and structural clearances.",
      href: "/forms/building",
      className: "md:col-span-2 md:row-span-1 bg-brand-surface",
      iconColor: "text-brand-primary"
    },
    {
      icon: HeartPulse,
      title: "Health Services",
      description: "Public health programs and assistance.",
      href: "/executive/directory",
      className: "md:col-span-1 md:row-span-1 bg-brand-surface",
      iconColor: "text-emerald-500"
    },
    {
      icon: Sprout,
      title: "Agriculture",
      description: "Support for farmers and fisherfolk.",
      href: "/executive/directory",
      className: "md:col-span-1 md:row-span-1 bg-brand-surface",
      iconColor: "text-green-500"
    }
  ];

  return (
    <section id="services" className="py-32 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="section-label">Municipal Services</span>
          <h2 className="section-title">Digital Governance</h2>
          <p className="text-brand-muted font-medium text-lg max-w-2xl mx-auto">
            Streamlining public services through innovation. Access essential municipal functions directly from your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 ${service.className} ${service.className.includes('bg-brand-primary') ? '' : 'hover:bg-white hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-brand-border'}`}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${service.className.includes('bg-brand-primary') ? 'bg-white/20' : 'bg-brand-primary/5'}`}>
                  <service.icon size={24} className={service.iconColor} />
                </div>
                
                <div>
                  <h3 className={`text-xl font-bold mb-2 tracking-tight font-display ${service.className.includes('bg-brand-primary') ? 'text-white' : 'text-brand-text'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm font-semibold leading-relaxed ${service.className.includes('bg-brand-primary') ? 'text-orange-50' : 'text-brand-muted'}`}>
                    {service.description}
                  </p>
                </div>

                <Link 
                  to={service.href}
                  className={`mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${service.className.includes('bg-brand-primary') ? 'text-white hover:gap-3' : 'text-brand-primary hover:gap-3'}`}
                >
                  Learn More <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Decorative Background for Primary Card */}
              {service.className.includes('bg-brand-primary') && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


