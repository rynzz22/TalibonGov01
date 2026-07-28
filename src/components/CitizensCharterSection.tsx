import { motion } from "motion/react";
import { Download, ArrowRight, Building2, Users, HeartPulse, GraduationCap, Sprout, ShieldCheck, Smartphone, Globe, Search, FileText, CreditCard, Scale, Briefcase, Landmark, Shovel, MapPin, Trash2, Camera, UserPlus, Cross } from "lucide-react";

export default function CitizensCharterSection() {
  const offices = [
    { name: "Mayor's Office", services: 5, desc: "Issues permits, clearances, business licenses, and handles executive services.", icon: Landmark },
    { name: "SB Office", services: 5, desc: "Reviews barangay ordinances, accredits NGOs, and processes tricycle franchises.", icon: Scale },
    { name: "MSWDO", services: 7, desc: "Provides social protection services for senior citizens, PWDs, and families in crisis.", icon: HeartPulse },
    { name: "HRMO", services: 5, desc: "Issues service records, employment certificates, and salary adjustments for LGU employees.", icon: Users },
    { name: "Budget Office", services: 3, desc: "Certifies obligation requests and reviews barangay and SK budgets.", icon: FileText },
    { name: "Assessor's Office", services: 4, desc: "Issues tax declarations, land certifications, and processes property transfers.", icon: MapPin },
    { name: "Accounting Office", services: 3, desc: "Processes and approves disbursement vouchers and financial documents.", icon: CreditCard },
    { name: "Treasurer's Office", services: 8, desc: "Handles business registrations, tax collections, and treasury services.", icon: Landmark },
    { name: "Agriculture Office", services: 7, desc: "Provides agricultural support services including AI and crop programs.", icon: Sprout },
    { name: "Engineering Office", services: 5, desc: "Issues building permits, certificates of occupancy, and oversees infrastructure.", icon: Shovel },
    { name: "LCRO", services: 12, desc: "Processes civil registry documents including birth, marriage, and death certificates.", icon: FileText },
    { name: "MPDO", services: 4, desc: "Issues locational clearances and coordinates comprehensive land use planning.", icon: Globe },
    { name: "LDRRMO", services: 5, desc: "Responds to emergencies, provides ambulance services, and conducts training.", icon: ShieldCheck },
    { name: "RHU", services: 6, desc: "Provides primary healthcare services including prenatal care and consultations.", icon: HeartPulse },
    { name: "Solid Waste Office", services: 3, desc: "Manages waste collection, disposal, and environmental sanitation.", icon: Trash2 },
    { name: "Tourism Office", services: 3, desc: "Facilitates ecotourism activities and tourist coordination.", icon: Camera },
    { name: "PESO", services: 4, desc: "Facilitates employment programs including SPES and GIP.", icon: Briefcase },
    { name: "Cemetery Office", services: 4, desc: "Administers burial lot availments and niche reservations.", icon: Cross },
  ];

  return (
    <section id="charter" className="py-10 sm:py-14 bg-brand-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 mb-10 sm:mb-12">
          <div className="max-w-2xl space-y-2 sm:space-y-3">
            <span className="section-label">RA 11032 — Anti-Red Tape Authority</span>
            <h2 className="section-title">Citizen's Charter 2026</h2>
            <p className="text-xs sm:text-sm text-brand-muted font-normal leading-relaxed">
              Official guide to government services — requirements, step-by-step procedures, fees, and processing times for each municipal office.
            </p>
          </div>
          <div className="shrink-0">
            <button className="minimal-button-primary text-xs sm:text-sm">
              Download Full Charter (PDF) <Download size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {offices.map((office, idx) => (
            <motion.div
              key={office.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-brand-bg border border-brand-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  <office.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  {office.services} services
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-brand-text mb-1.5 font-display uppercase tracking-tight">{office.name}</h3>
              <p className="text-brand-muted text-xs sm:text-sm font-normal leading-relaxed">
                {office.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
