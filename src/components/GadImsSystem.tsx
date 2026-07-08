import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Users, Database, Search, 
  BarChart3, Activity, FileCheck, Landmark, 
  GraduationCap, Settings, ChevronRight, Info,
  ShieldCheck, Cpu, Wifi, Globe, Terminal, Clock as ClockIcon,
  UserPlus
} from 'lucide-react';
import GadEntryModule from './GadEntryModule';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';

interface SubSection {
  subTitle: string;
  items: string[];
}

interface Section {
  id: string;
  title: string;
  content: SubSection[];
}

interface GadImsData {
  title: string;
  subtitle: string;
  sections: Section[];
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  overview: <Info size={18} />,
  governance: <Landmark size={18} />,
  "data-entry": <UserPlus size={18} />,
  "data-modules": <Database size={18} />,
  analysis: <Search size={18} />,
  budgeting: <BarChart3 size={18} />,
  me: <Activity size={18} />,
  reporting: <ClipboardList size={18} />,
  barangay: <Users size={18} />,
  knowledge: <GraduationCap size={18} />,
  admin: <Settings size={18} />,
  annexes: <FileCheck size={18} />,
};

const MOCK_CHART_DATA = [
  { name: 'Health', value: 400, color: '#2563eb' },
  { name: 'Education', value: 300, color: '#3b82f6' },
  { name: 'Economy', value: 300, color: '#60a5fa' },
  { name: 'Governance', value: 200, color: '#93c5fd' },
];

const MOCK_BAR_DATA = [
  { year: '2021', budget: 45 },
  { year: '2022', budget: 52 },
  { year: '2023', budget: 61 },
  { year: '2024', budget: 75 },
];

const GadImsSystem: React.FC<{ data: GadImsData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState(data?.sections?.[0]?.id || "overview");
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Inject Data Entry tab if not in data sections
  const sections = data?.sections ? [
    ...data.sections.slice(0, 2),
    { id: 'data-entry', title: '03. Individual Profiling', content: [] },
    ...data.sections.slice(2)
  ] : [];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data?.sections || data.sections.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-brand-border">
        <Database size={48} className="mx-auto text-brand-muted mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-brand-text mb-2 tracking-tight">GAD-IMS Database Offline</h3>
        <p className="text-sm text-brand-muted font-medium max-w-md mx-auto">
          The Gender and Development Integrated Management System data has not been seeded yet. 
          Please contact the system administrator to initialize the GAD database.
        </p>
      </div>
    );
  }

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-white border border-brand-border rounded-[2.5rem] p-4 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* System Decoration */}
      <div className="absolute top-0 right-0 p-8 flex items-center gap-6 opacity-30 select-none pointer-events-none">
        <div className="text-right">
          <div className="text-[10px] font-mono font-black text-brand-primary uppercase tracking-widest">SYSTEM_VERSION: 2.1.0-STABLE</div>
          <div className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">ENCRYPTION: AES-256-GCM</div>
        </div>
        <div className="p-3 bg-brand-primary/5 rounded-2xl">
          <ShieldCheck size={24} className="text-brand-primary" />
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="bg-brand-text text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Cpu size={20} className="text-brand-accent animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">CORE_SYSTEM</span>
            </div>
            <h2 className="text-2xl font-black leading-tight uppercase tracking-tighter mb-2">Talibon GAD-IMS</h2>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">
              Mainstreaming Gender-Responsive Governance through Data
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Globe size={120} />
          </div>
        </div>
        
        <nav className="flex flex-col gap-1 p-2 bg-gray-50 rounded-[2rem] border border-brand-border/50">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left relative group ${
                activeTab === section.id 
                  ? 'bg-white text-brand-text shadow-md border border-brand-border' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-white/50'
              }`}
            >
              <span className={`transition-colors p-2 rounded-xl scale-90 ${activeTab === section.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-muted group-hover:bg-white transition-all'}`}>
                {SECTION_ICONS[section.id] || <ChevronRight size={18} />}
              </span>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-brand-primary opacity-50 uppercase tracking-tighter mb-0.5">
                  MODULE_{section.id.toUpperCase()}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {section.title.split('. ')[1] || section.title}
                </span>
              </div>
              {activeTab === section.id && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute left-1 w-1 h-6 bg-brand-primary rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* System Stats Footer */}
        <div className="mt-auto p-6 bg-gray-50 rounded-2xl border border-brand-border/50 font-mono text-[10px] space-y-3 uppercase tracking-tighter">
          <div className="flex justify-between items-center text-brand-muted">
            <span className="flex items-center gap-2"><Wifi size={10} className="text-green-500" /> Connection</span>
            <span className="font-bold text-gray-900 leading-none">SECURE_ACTIVE</span>
          </div>
          <div className="flex justify-between items-center text-brand-muted">
            <span className="flex items-center gap-2"><Terminal size={10} /> Local Time</span>
            <span className="font-bold text-brand-text flex items-center gap-1">
              <ClockIcon size={10} /> {time}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-border relative">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  <Activity size={12} /> Active Module
                </div>
                <h1 className="text-4xl font-black text-brand-text uppercase tracking-tighter leading-tight">
                  {activeSection?.title}
                </h1>
              </div>
            </div>

            {/* Dashboard Visualization Overlay (Optional based on section) */}
            {activeTab === 'reporting' || activeTab === 'budgeting' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-brand-text text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="space-y-6 relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Dashboard / Metrics</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_BAR_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="year" stroke="#ffffff60" fontSize={10} />
                        <YAxis stroke="#ffffff60" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1d1d1f', border: 'none', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="budget" fill="#58a6ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] font-mono text-white/40 uppercase">Interactive Budget Attribution Analysis v1.4</p>
                </div>
                <div className="space-y-6 relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Gender Sector Distribution</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_CHART_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {MOCK_CHART_DATA.map((entry, index) => (
                            <Cell key={`recharts-pie-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {MOCK_CHART_DATA.map(d => (
                      <div key={`chart-legend-${d.name}`} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'data-entry' ? (
              <div className="flex-1 mt-4">
                <GadEntryModule />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeSection?.content.map((sub, idx) => (
                  <motion.div 
                    key={`gad-subsection-${idx}`} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-brand-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <h3 className="text-sm font-black text-brand-text uppercase tracking-widest pb-4 mb-6 border-b border-gray-100 flex items-center justify-between">
                        {sub.subTitle}
                        <span className="text-[8px] font-mono text-brand-primary opacity-30">SUB_SEC_{idx.toString().padStart(2, '0')}</span>
                      </h3>
                      <ul className="space-y-4">
                        {sub.items.map((item, i) => (
                          <li key={`gad-item-${idx}-${i}`} className="flex gap-4 text-xs text-brand-muted font-bold leading-relaxed group/item">
                            <div className="mt-1 flex flex-col items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover/item:scale-150 transition-transform shrink-0" />
                              <div className="w-px h-full bg-gray-100 mt-1" />
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                      <Database size={100} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Background Narrative Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
              {activeTab && SECTION_ICONS[activeTab] && (
                <div className="scale-[15]">
                  {SECTION_ICONS[activeTab]}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GadImsSystem;
