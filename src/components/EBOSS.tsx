import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, CreditCard, FileCheck, Search } from "lucide-react";

export default function EBOSS() {
  const steps = [
    {
      step: "Step 1",
      title: "Application & Assessment",
      description: "Submit your application online and receive the computed taxes and fees after review.",
      subSteps: [
        { id: "1", label: "Application", desc: "Submit your application and upload required documents." },
        { id: "2", label: "Assessment", desc: "Application is reviewed; taxes and fees are computed." }
      ]
    },
    {
      step: "Step 2",
      title: "Payment",
      description: "Pay the assessed taxes and fees through the available payment options.",
      subSteps: [
        { id: "3", label: "Payment", desc: "Pay using the available payment options." }
      ]
    },
    {
      step: "Step 3",
      title: "Issuance & Tracking",
      description: "Receive your approved business permit and track your application status online.",
      subSteps: [
        { id: "4", label: "Issuance", desc: "Approved permit and documents are issued." },
        { id: "5", label: "Track", desc: "Check real-time status and updates anytime." }
      ]
    }
  ];

  return (
    <section id="eboss" className="py-32 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="section-label">Electronic Business One-Stop Shop</span>
              <h2 className="section-title">E-BOSS Portal</h2>
              <p className="text-base text-slate-700 dark:text-slate-200 font-normal leading-relaxed">
                Apply for and receive your Business Permit in simple steps. Our digital platform streamlines the entire process from application to issuance.
              </p>
            </div>

            <div className="pt-8">
              <a 
                href="https://talibon-citizen-stg.multisyscorp.io/e-services"
                target="_blank"
                rel="noopener noreferrer"
                className="minimal-button-primary inline-flex"
              >
                Go to E-BOSS Portal <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-brand-surface border border-brand-border/60 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-500 shadow-sm"
              >
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-extrabold text-brand-primary uppercase tracking-[0.3em] bg-brand-primary/10 px-4 py-1.5 rounded-full shadow-xs">
                      {step.step}
                    </span>
                    <h3 className="text-base font-semibold text-brand-text font-display uppercase tracking-tight">{step.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-normal leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step.subSteps.map((sub) => (
                      <div key={sub.id} className="p-4 bg-brand-surface rounded-2xl border border-brand-border flex gap-4 items-start shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-extrabold text-xs shrink-0">
                          {sub.id}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-brand-text dark:text-dark-text uppercase tracking-widest mb-1">{sub.label}</h4>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-tight">{sub.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Text - Embossment */}
      <div className="absolute bottom-0 right-0 text-[15vw] font-black text-brand-primary/[0.01] select-none pointer-events-none leading-none font-display tracking-tighter translate-y-1/4">
        TALIBON
      </div>
    </section>
  );
}
