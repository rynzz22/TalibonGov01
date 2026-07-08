import { motion } from "motion/react";
import { FileText, BarChart3, ClipboardList, ShieldCheck, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function TransparencyGovernance() {
  const items = [
    {
      title: "Annual Budget",
      desc: "Approved annual budget documents, appropriation ordinances, and budget allocation summaries.",
      icon: BarChart3,
      href: "/transparency/budget"
    },
    {
      title: "Bids & Public Offerings",
      desc: "Invitation to bid, abstracts of bids, notices of award, and approved contract documents.",
      icon: ClipboardList,
      href: "/transparency/biddings"
    },
    {
      title: "Annual Procurement Plan",
      desc: "Consolidated annual procurement plan and updates, including all procurement activities.",
      icon: FileText,
      href: "/transparency/disclosure"
    },
    {
      title: "Full Disclosure Policy",
      desc: "Compliance documents and reports under the DILG Full Disclosure Policy and SGLG.",
      icon: ShieldCheck,
      href: "/transparency/disclosure"
    }
  ];

  return (
    <section id="transparency" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <span className="section-label">Good Governance</span>
            <h2 className="section-title">Transparency & Accountability</h2>
            <p className="text-brand-muted font-medium text-lg leading-relaxed">
              We are committed to open governance. Access official reports, budget allocations, and procurement activities of the Municipal Government of Talibon.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-brand-border flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Philippine_Transparency_Seal.svg/960px-Philippine_Transparency_Seal.svg.png" 
                alt="Transparency Seal" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-16 h-16 rounded-full border border-brand-border flex items-center justify-center">
              <img 
                src="https://ncda.gov.ph/wp-content/uploads/2023/06/freedom-of-information-logo.jpg" 
                alt="FOI" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-10 rounded-[3rem] bg-brand-surface border border-brand-border hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-brand-text mb-4 font-display uppercase tracking-tight">{item.title}</h3>
                <p className="text-brand-muted font-medium leading-relaxed mb-8 flex-1">
                  {item.desc}
                </p>
                <Link 
                  to={item.href}
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] group-hover:gap-3 transition-all"
                >
                  View Documents <ArrowUpRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bagong_Pilipinas_logo.png/1920px-Bagong_Pilipinas_logo.png" alt="Bagong Pilipinas" className="h-12 object-contain" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Seal_of_the_Philippines.svg/1280px-Seal_of_the_Philippines.svg.png" alt="PH Seal" className="h-12 object-contain" referrerPolicy="no-referrer" />
        </div>
      </div>
    </section>
  );
}
