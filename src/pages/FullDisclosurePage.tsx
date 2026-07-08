import React from 'react';
import { motion } from 'motion/react';
import { Shield, ExternalLink, Download } from 'lucide-react';

const FullDisclosurePage: React.FC = () => {
  const imageUrl = "https://talibon.gov.ph/wp-content/themes/yootheme/cache/e8/RegistrationCert_page-0001-e8213d59.webp";

  return (
    <div className="pt-32 md:pt-44 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-8">
            Full Disclosure
          </h1>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 inline-flex">
            <Shield className="text-blue-600" size={24} />
            <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Transparency & Accountability Policy</span>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Official Certification</h2>
                <p className="text-gray-500 font-medium mt-2">Registration and Compliance Certificate for the Municipality of Talibon.</p>
              </div>
              <div className="flex gap-4">
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                >
                  <ExternalLink size={18} />
                  VIEW FULL IMAGE
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-12 flex justify-center bg-white">
            <div className="relative group max-w-4xl w-full">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              <img 
                src={imageUrl} 
                alt="Full Disclosure Policy Registration Certificate" 
                className="w-full h-auto rounded-2xl shadow-lg border border-gray-100"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">About the Policy</h3>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              The Full Disclosure Policy (FDP) requires local government units to fully disclose particular financial transactions to keep their constituents informed of how the local budget is managed, disbursed and used.
            </p>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              This promotes honest and efficient governance by allowing citizens to monitor the LGU's financial performance and infrastructure projects.
            </p>
          </div>
          
          <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6 relative z-10">Our Commitment</h3>
            <ul className="space-y-4 relative z-10">
              {[
                "Regular financial reporting",
                "Public access to procurement data",
                "Open communication on projects",
                "Strict adherence to DILG guidelines"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FullDisclosurePage;
