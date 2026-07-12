import { motion } from "motion/react";
import { 
  UserCircle, 
  FileText, 
  ShieldCheck, 
  FileCheck, 
  CreditCard, 
  Search,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PopularServices() {
  const services = [
    { name: "eRBI", to: "/e-services", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { name: "ePermits", to: "/e-services?type=Business Permit Clearance", color: "bg-green-100 text-green-700 border-green-200" },
    { name: "eClearance", to: "/e-services?type=Barangay Clearance", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { name: "eCertificate", to: "/e-services", color: "bg-red-100 text-red-700 border-red-200" },
    { name: "eCedula", to: "/e-services?type=Community Tax Certificate", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { name: "Document Verification", to: "/e-services", color: "bg-gray-100 text-gray-700 border-gray-200" },
  ];

  return (
    <section className="py-24 bg-brand-bg" id="popular-services">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text uppercase tracking-tight mb-12">POPULAR SERVICES</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {services.map((service, idx) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={service.to}
                className={`px-8 py-4 rounded-xl border font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-1 block ${service.color}`}
              >
                {service.name}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link 
            to="/executive/directory" 
            className="px-8 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            View All <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
