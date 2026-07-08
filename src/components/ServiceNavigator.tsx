import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, FileText, CreditCard, UserCheck, Map, Download, ArrowRight, Info } from "lucide-react";

const services = [
  { id: 1, name: "Business Permit", category: "E-BOSS", icon: CreditCard, description: "Apply or renew your business permit online.", requirements: ["DTI/SEC Registration", "Barangay Clearance", "Lease Contract"], fee: "Varies based on assessment" },
  { id: 2, name: "Birth Certificate", category: "Civil Registry", icon: FileText, description: "Request for a certified true copy of birth certificate.", requirements: ["Valid ID", "Request Form"], fee: "₱155.00" },
  { id: 3, name: "Barangay Clearance", category: "General", icon: UserCheck, description: "Secure a clearance from your local barangay.", requirements: ["Cedula", "Proof of Residency"], fee: "₱50.00" },
  { id: 4, name: "Real Property Tax", category: "Treasury", icon: Map, description: "Pay your land or property taxes online.", requirements: ["Tax Declaration Number"], fee: "Based on property value" },
  { id: 5, name: "Building Permit", category: "Engineering", icon: Download, description: "Apply for construction or renovation permits.", requirements: ["Building Plans", "Title of Property"], fee: "Based on project scope" },
];

export default function ServiceNavigator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-32 bg-brand-surface dark:bg-dark-surface/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">Service Navigator</span>
          <h2 className="section-title">Find What You Need Instantly</h2>
          <div className="relative mt-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search for a service (e.g. 'Business Permit', 'Birth Certificate')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white dark:bg-dark-surface rounded-[2rem] shadow-xl shadow-black/5 border border-brand-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-lg font-medium dark:text-dark-text"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="minimal-card p-8 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 dark:bg-white/5 flex items-center justify-center text-brand-primary dark:text-brand-secondary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                    <service.icon size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{service.category}</span>
                </div>
                <h3 className="text-xl font-black text-brand-text dark:text-dark-text mb-2 font-display">{service.name}</h3>
                <p className="text-sm text-brand-muted dark:text-dark-muted font-medium mb-6 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-2 text-brand-primary dark:text-brand-secondary font-bold text-[10px] uppercase tracking-[0.2em]">
                  View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
                className="absolute inset-0 bg-brand-text/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-brand-primary text-white flex items-center justify-center">
                        <selectedService.icon size={40} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brand-primary dark:text-brand-secondary uppercase tracking-[0.4em] mb-2 block">{selectedService.category}</span>
                        <h3 className="text-3xl font-black text-brand-text dark:text-dark-text font-display">{selectedService.name}</h3>
                      </div>
                    </div>
                    <button onClick={() => setSelectedService(null)} className="p-3 hover:bg-brand-surface dark:hover:bg-dark-bg rounded-2xl transition-colors">
                      <Search size={24} className="rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="flex items-center gap-2 text-xs font-bold text-brand-text dark:text-dark-text uppercase tracking-widest mb-4">
                        <Info size={16} className="text-brand-primary" /> Description
                      </h4>
                      <p className="text-brand-muted dark:text-dark-muted font-medium leading-relaxed">{selectedService.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text dark:text-dark-text uppercase tracking-widest mb-4">Requirements</h4>
                        <ul className="space-y-2">
                          {selectedService.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-brand-muted dark:text-dark-muted">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-text dark:text-dark-text uppercase tracking-widest mb-4">Processing Fee</h4>
                        <p className="text-2xl font-black text-brand-primary dark:text-brand-secondary font-display">{selectedService.fee}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex gap-4">
                    <button className="flex-1 minimal-button-primary">Apply Online</button>
                    <button className="flex-1 minimal-button-outline">Download Form</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Text - Embossment */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-brand-primary/[0.02] select-none pointer-events-none leading-none font-display tracking-tighter">
        NAVIGATE
      </div>
    </section>
  );
}
