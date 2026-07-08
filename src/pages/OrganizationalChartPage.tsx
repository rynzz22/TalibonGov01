import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Users, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MOCK_OFFICIALS = [
  { id: "of1", level: 1, name: "Hon. Janette A. Garcia", role: "Municipal Mayor", display_order: 1 },
  { id: "of2", level: 2, name: "Hon. Epifanio G. Evardone", role: "Municipal Vice Mayor", display_order: 1 },
  { id: "of3", level: 2, name: "Hon. Cecilio C. Garcia", role: "SB Member", display_order: 2 },
  { id: "of4", level: 2, name: "Hon. Gonzalo D. Castro Jr.", role: "SB Member", display_order: 3 },
  { id: "of5", level: 3, name: "Dr. Maria Luisa M. Reyes", role: "Municipal Health Officer", display_order: 1 },
  { id: "of6", level: 3, name: "Engr. Romeo A. Valenzuela", role: "Municipal Engineer", display_order: 2 },
  { id: "of7", level: 3, name: "Mrs. Elsa B. Torralba", role: "Municipal Treasurer", display_order: 3 }
];

const DEPARTMENT_LOGOS: Record<string, string> = {
  "Office Of Municipal Agriculturist": "http://talibon.gov.ph/wp-content/uploads/2025/10/1.png",
  "Municipal Treasury Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/10.png",
  "Municipal Planning And Development Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/7.png",
  "Municipal Accounting Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/3.png",
  "Municipal Economic Development & Investment Promotions Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/3.png",
  "Municipal Public Employment Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/5.png",
  "Municipal Social Welfare And Development Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/8.png",
  "Municipal Market Administration Office": "http://talibon.gov.ph/wp-content/uploads/2025/10/6.png",
  "Talibon Traffic Management Unit": "http://talibon.gov.ph/wp-content/uploads/2025/10/9.png",
  "Municipal Internal Auditing Unit": "http://talibon.gov.ph/wp-content/uploads/2025/10/4.png",
  "Municipal General Services Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/General-Services.png",
  "Municipal Human Resource Management Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/HRMO.png",
  "Office Of The Municipal Civil Registrar": "https://talibon.gov.ph/wp-content/uploads/2022/01/LCR.png",
  "Municipal Assessor's Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/Assessor.png",
  "Municipal Budget Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/Budget-Office.png",
  "Municipal Engineering Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/Engineering-Office.png",
  "Municipal Health Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/Health-Office.png",
  "Municipal Disaster Risk Reduction And Management Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/DRRMO.png",
  "Municipal Information Technology Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/ITO.png",
  "Municipal Tourism Office": "https://talibon.gov.ph/wp-content/uploads/2022/01/Tourism-Office.png",
};

const OrganizationalChartPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const structuredData = {
        mayor: MOCK_OFFICIALS.find((o: any) => o.level === 1) || { name: 'N/A', role: 'Municipal Mayor' },
        level2: MOCK_OFFICIALS.filter((o: any) => o.level === 2),
        departments: MOCK_OFFICIALS.filter((o: any) => o.level === 3)
      };
      setData(structuredData);
      setLoading(false);
      return;
    }

    const fetchOfficials = async () => {
      setLoading(true);
      const { data: officials, error: supabaseError } = await supabase
        .from('officials')
        .select('*')
        .order('level', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (supabaseError) {
        console.warn("Error fetching officials:", supabaseError);
        const structuredData = {
          mayor: MOCK_OFFICIALS.find((o: any) => o.level === 1) || { name: 'N/A', role: 'Municipal Mayor' },
          level2: MOCK_OFFICIALS.filter((o: any) => o.level === 2),
          departments: MOCK_OFFICIALS.filter((o: any) => o.level === 3)
        };
        setData(structuredData);
      } else if (officials && officials.length > 0) {
        const structuredData = {
          mayor: officials.find((o: any) => o.level === 1) || { name: 'N/A', role: 'Municipal Mayor' },
          level2: officials.filter((o: any) => o.level === 2),
          departments: officials.filter((o: any) => o.level === 3)
        };
        setData(structuredData);
      } else {
        setData(null);
      }
      setLoading(false);
    };

    fetchOfficials();

    // Subscribe
    const channel = supabase
      .channel('officials-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'officials' }, () => fetchOfficials())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen bg-brand-bg">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20 px-4 max-w-7xl mx-auto min-h-screen bg-brand-bg pt-32">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pb-20 px-4 max-w-7xl mx-auto min-h-screen bg-brand-bg pt-32 flex flex-col items-center justify-center text-center">
        <Users className="w-16 h-16 text-brand-muted/30 mb-4" />
        <h2 className="text-2xl font-bold text-brand-text mb-2">Structure Not Found</h2>
        <p className="text-brand-muted max-w-md">The organizational chart is currently being updated. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-16">
          <span className="section-label">Executive Structure</span>
          <h1 className="section-title">
            Organizational Chart
          </h1>
          <p className="text-xl text-brand-muted font-medium max-w-3xl leading-relaxed">
            The administrative hierarchy of the Municipality of Talibon, showcasing the leadership and departments dedicated to public service.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-12 py-8">
          {/* Level 1: Mayor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="p-10 bg-brand-primary text-white rounded-[2.5rem] shadow-2xl text-center min-w-[320px] relative">
              <h3 className="text-2xl font-bold mb-1 font-display uppercase tracking-tight">{data.mayor.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">{data.mayor.role}</p>
            </div>
            <div className="w-px h-12 bg-brand-border" />
          </motion.div>

          {/* Level 2: Admin & SB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-32 relative w-full max-w-4xl">
            {/* Horizontal connector */}
            <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-px bg-brand-border -translate-y-12" />
            
            {data.level2.map((item: any, idx: number) => (
              <motion.div 
                key={`${item.role}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex flex-col items-center relative"
              >
                {/* Vertical connector to horizontal line */}
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-border -translate-y-12" />
                
                <div className="p-8 bg-brand-surface text-brand-text rounded-[2rem] text-center w-full border border-brand-border hover:border-brand-primary/30 transition-all">
                  <h4 className="text-lg font-bold mb-1 font-display uppercase tracking-tight">{item.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{item.role}</p>
                </div>
                <div className="w-px h-12 bg-brand-border" />
              </motion.div>
            ))}
          </div>

          {/* Level 3: Departments */}
          <div className="w-full relative">
            {/* Horizontal connector for departments */}
            <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-brand-border" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
              {data.departments.map((dept: any, idx: number) => (
                  <motion.div 
                    key={`${dept.role}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="flex flex-col items-center relative"
                  >
                    {/* Vertical connector to horizontal line */}
                    <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-brand-border -translate-y-12" />
                    
                    <div className="p-6 bg-white border border-brand-border rounded-2xl hover:shadow-xl hover:border-brand-primary/30 transition-all text-center w-full group h-full flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-brand-surface rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
                        {dept.image_url || DEPARTMENT_LOGOS[dept.role] ? (
                          <img 
                            src={dept.image_url || DEPARTMENT_LOGOS[dept.role]} 
                            alt={`${dept.role} Logo`} 
                            className="w-full h-full object-contain p-2"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-5 h-5 text-brand-muted/30" />
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-brand-text mb-1 leading-tight font-display uppercase tracking-tight">{dept.name}</h5>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted">{dept.role}</p>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalChartPage;
