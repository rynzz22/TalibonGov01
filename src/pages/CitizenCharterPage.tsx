import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';

const CitizenCharterPage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2026/02/2025-CITIZENS-CHARTER-FINALE.pdf";

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-brand-bg relative overflow-hidden">
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
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-text uppercase tracking-tighter leading-none mb-8 font-display">
            Citizen Charter
          </h1>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-brand-border inline-flex shadow-sm">
            <ShieldCheck className="text-brand-primary" size={24} />
            <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">Talibon Municipality – Official Documents</span>
          </div>
        </div>

        <div className="pro-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-8 uppercase tracking-tight leading-none font-display">
                Citizen Charter
              </h2>
              <p className="text-xl text-brand-muted font-medium mb-12 leading-relaxed">
                The Citizen's Charter is a document of commitments made by a Government organization to the citizens in relation to the services being provided to them.
              </p>
              
              <a 
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-button inline-flex items-center justify-center gap-4 px-12 py-6 text-lg w-full md:w-auto"
              >
                VIEW PDF
                <ArrowUpRight size={24} />
              </a>
            </div>
            
            <div className="bg-brand-bg p-12 md:p-20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary via-transparent to-transparent" />
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative z-10 w-full max-w-sm aspect-[3/4] bg-white rounded-[2.5rem] shadow-2xl border border-brand-border flex flex-col items-center justify-center p-12 text-center group cursor-pointer"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <div className="w-24 h-24 bg-brand-bg rounded-3xl flex items-center justify-center mb-8 group-hover:bg-brand-primary transition-colors">
                  <FileText size={48} className="text-brand-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-extrabold text-brand-text mb-2 uppercase tracking-tight font-display">2025 Edition</h3>
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Official Publication</p>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">Click to Open</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Transparency</h4>
            <p className="text-brand-muted font-medium">Ensuring open and honest communication between the LGU and the people of Talibon.</p>
          </div>
          <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Accountability</h4>
            <p className="text-brand-muted font-medium">Holding our government officials responsible for the quality of services provided.</p>
          </div>
          <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Efficiency</h4>
            <p className="text-brand-muted font-medium">Streamlining processes to serve our citizens faster and more effectively.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CitizenCharterPage;
