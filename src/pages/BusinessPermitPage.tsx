import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Download, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';

const BusinessPermitPage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf";

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
        className="pro-card overflow-hidden relative z-10"
      >
        {/* Modern Gradient Header */}
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80 p-16 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight mb-6 font-display">
              Business Permit
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-bold uppercase tracking-[0.3em]">
              Talibon Municipality – Official Documents
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="pro-card p-8 md:p-12 border border-brand-border flex flex-col md:flex-row items-center gap-8 group hover:border-brand-primary/30 transition-all"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/20">
                <Briefcase className="text-white" size={36} />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-text uppercase tracking-tight mb-2 font-display">
                  Business Permit Application
                </h3>
                <p className="text-brand-muted font-medium text-lg">
                  Required form for new business registration and renewals.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full md:w-auto">
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pro-button inline-flex items-center justify-center gap-4 px-10 py-5 w-full md:w-auto"
                >
                  <Download size={20} />
                  DOWNLOAD PDF
                </a>
              </div>
            </motion.div>

            {/* Online Payment Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="pro-card p-8 md:p-12 border-2 border-brand-primary/20 bg-brand-primary/5 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-border">
                <CreditCard className="text-brand-primary" size={36} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight mb-2 font-display">
                  Simplified Online Payment
                </h3>
                <p className="text-brand-muted font-medium">
                  Skip the long lines. Pay your processing fees online securely via HitPay (GCash, Maya, Cards).
                </p>
              </div>

              <div className="w-full md:w-72">
                <PaymentButton itemName="Business Permit Processing Fee" amount={500} />
              </div>
            </motion.div>

            {/* Process Overview */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Step 1: Application</h4>
                <p className="text-brand-muted font-medium">Fill out the unified application form and submit required documents to the BPLO.</p>
              </div>
              <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Step 2: Assessment</h4>
                <p className="text-brand-muted font-medium">Wait for the assessment of taxes, fees, and other charges by the Municipal Treasurer.</p>
              </div>
              <div className="pro-card p-8 border border-brand-border hover:border-brand-primary/30 transition-all">
                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">Step 3: Payment</h4>
                <p className="text-brand-muted font-medium">Pay the assessed amount and claim your Business Permit and Mayor's Clearance.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessPermitPage;
