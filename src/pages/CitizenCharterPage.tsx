import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowUpRight } from 'lucide-react';

const CitizenCharterPage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2026/02/2025-CITIZENS-CHARTER-FINALE.pdf";

  return (
    <div className="pb-12 px-4 md:px-6 max-w-5xl mx-auto bg-brand-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-brand-primary/5 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text uppercase tracking-tight leading-none font-display">
            Citizen Charter
          </h1>
        </div>

        <div className="pro-card overflow-hidden rounded-2xl border border-brand-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-3 uppercase tracking-tight leading-none font-display">
                Citizen Charter
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted font-normal mb-6 leading-relaxed">
                The Citizen's Charter is a document of commitments made by a Government organization to the citizens in relation to the services being provided to them.
              </p>
              
              <a 
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-button inline-flex items-center justify-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider w-full md:w-auto rounded-xl"
              >
                VIEW PDF
                <ArrowUpRight size={18} />
              </a>
            </div>
            
            <div className="bg-brand-bg p-6 md:p-10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary via-transparent to-transparent" />
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.03, rotate: 1 }}
                className="relative z-10 w-full max-w-[220px] aspect-[3/4] bg-white rounded-2xl shadow-lg border border-brand-border flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <div className="w-14 h-14 bg-brand-bg rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-colors">
                  <FileText size={28} className="text-brand-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-brand-text mb-1 uppercase tracking-tight font-display">2025 Edition</h3>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Official Publication</p>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Click to Open</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pro-card p-5 rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Transparency</h4>
            <p className="text-xs text-brand-muted font-medium leading-relaxed">Ensuring open and honest communication between the LGU and the people of Talibon.</p>
          </div>
          <div className="pro-card p-5 rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Accountability</h4>
            <p className="text-xs text-brand-muted font-medium leading-relaxed">Holding our government officials responsible for the quality of services provided.</p>
          </div>
          <div className="pro-card p-5 rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Efficiency</h4>
            <p className="text-xs text-brand-muted font-medium leading-relaxed">Streamlining processes to serve our citizens faster and more effectively.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CitizenCharterPage;
