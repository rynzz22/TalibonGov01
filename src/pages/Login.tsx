import React, { useState, useEffect } from "react";
import { useAuth, OfficialRole } from "../contexts/SupabaseAuthContext";
import { BARANGAYS } from "../constants/barangayConfig";
import { motion } from "motion/react";
import { Globe, Shield, Lock, ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { user, profile, signInWithGoogle, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<OfficialRole>("barangay_admin");
  const [selectedBarangay, setSelectedBarangay] = useState(BARANGAYS[0].slug);
  const [fullName, setFullName] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        navigate("/admin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [profile, navigate]);

  const handleRegisterProfile = async () => {
    if (!user) return;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: selectedRole,
      barangay_id: selectedRole === "barangay_admin" ? selectedBarangay : null,
    });

    if (!error) {
      await refreshProfile();
      setRegistrationSuccess(true);
    } else {
      alert("Error: " + error.message);
    }
  };

  if (profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full minimal-card p-12"
        >
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black mb-2">Authenticated</h2>
          <p className="text-brand-muted font-medium mb-8">
            Welcome back, <span className="text-brand-text font-bold">{profile.full_name}</span>.
            <br />
            You are being redirected to the 
            <span className="text-brand-primary block font-black uppercase tracking-widest text-[10px] mt-1">CMS Control Dashboard</span>
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate("/admin")} 
              className="minimal-button-primary w-full flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} /> Go to Dashboard Now
            </button>
            <button onClick={signOut} className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full minimal-card p-12"
        >
          <div className="text-center mb-10">
            <span className="section-label">One Last Step</span>
            <h2 className="text-4xl font-black tracking-tight">Setup Admin Profile</h2>
            <p className="text-brand-muted font-medium mt-2">Identify your jurisdiction in the Talibon Digital Core.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Hon. Juan Dela Cruz"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4 block">Assign CMS Level</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedRole("municipal_admin")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${selectedRole === 'municipal_admin' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'}`}
                >
                  <Globe className={`mb-3 ${selectedRole === 'municipal_admin' ? 'text-brand-primary' : 'text-brand-muted'}`} />
                  <p className="font-bold text-sm">Macro CMS</p>
                  <p className="text-[10px] text-brand-muted opacity-60">Whole Municipality</p>
                </button>
                <button 
                  onClick={() => setSelectedRole("barangay_admin")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${selectedRole === 'barangay_admin' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'}`}
                >
                  <Shield className={`mb-3 ${selectedRole === 'barangay_admin' ? 'text-brand-primary' : 'text-brand-muted'}`} />
                  <p className="font-bold text-sm">Micro CMS</p>
                  <p className="text-[10px] text-brand-muted opacity-60">Specific Barangay</p>
                </button>
              </div>
            </div>

            {selectedRole === "barangay_admin" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Select Barangay</label>
                <select 
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none"
                >
                  {BARANGAYS.map(b => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            <button 
              disabled={!fullName}
              onClick={handleRegisterProfile} 
              className="minimal-button-primary w-full disabled:opacity-30"
            >
              Request Access <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1D4ED81a 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full minimal-card p-12 text-center"
      >
        <img 
          src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
          alt="Talibon Seal" 
          className="w-24 h-24 mx-auto mb-8 drop-shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-4xl font-black text-brand-text mb-2 tracking-tight">Admin Portal</h2>
        <p className="text-brand-muted font-medium mb-12">Talibon Digital Governance Core</p>

        <button 
          onClick={signInWithGoogle}
          className="w-full py-5 bg-white border-2 border-brand-border rounded-[2rem] flex items-center justify-center gap-4 hover:border-brand-primary transition-all group active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-125 transition-transform" />
          <span className="font-bold text-sm">Continue with Google Official</span>
        </button>

        <div className="mt-12 flex items-center justify-center gap-2 text-[8px] font-black text-brand-muted uppercase tracking-[0.2em]">
          <Lock size={12} /> Secure SSO Encryption Active
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
