import React from "react";
import { Clock, ShieldCheck, Banknote } from "lucide-react";
import { motion } from "motion/react";

interface PaymentButtonProps {
  itemName: string;
  amount: number;
  className?: string;
  label?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  itemName,
  amount,
  className = "",
  label = "Fee Assessment",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs"
      >
        <div className="flex items-center gap-2 shrink-0">
          <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span>Online Payment Coming Soon</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-amber-900/80 dark:text-amber-200 font-mono text-[11px] font-bold">
            PHP {amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </motion.div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Banknote size={13} className="text-emerald-600" />
          <span>Pay at Treasurer's Office</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          No online payment required now. Pay directly at the Municipal Treasurer's Office upon document verification and pickup.
        </p>
      </div>
    </div>
  );
};

export default PaymentButton;

