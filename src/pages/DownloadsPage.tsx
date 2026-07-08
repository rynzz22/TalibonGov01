import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, FileSpreadsheet, FileArchive, Search, Filter, ExternalLink, Building2, Briefcase, FileCheck, Landmark, Target, Activity } from 'lucide-react';
import { formsApi } from '../services/api';

interface DownloadItem {
  id: string | number;
  title: string;
  url: string;
  category: string;
  fileSize?: string;
  fileType?: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
}

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const [permits, buildings, zoning] = await Promise.all([
          formsApi.getBusinessPermits(),
          formsApi.getBuildingPermits(),
          formsApi.getZoningClearance()
        ]);

        const combined: DownloadItem[] = [
          ...(Array.isArray(permits?.data) ? permits.data : []).map((item: any) => ({ ...item, id: `business-${item.id}`, category: 'Business' })),
          ...(Array.isArray(buildings?.data) ? buildings.data : []).map((item: any) => ({ ...item, id: `building-${item.id}`, category: 'Building' })),
          ...(Array.isArray(zoning?.data) ? zoning.data : []).map((item: any) => ({ ...item, id: `zoning-${item.id}`, category: 'Zoning' })),
          // Adding hardcoded common forms for completeness
          { id: 'tax-dec', title: 'Tax Declaration Application', url: '#', category: 'Assessor', fileSize: '450 KB', fileType: 'PDF' },
          { id: 'residency', title: 'Barangay Residency Request Form', url: '#', category: 'Barangay', fileSize: '120 KB', fileType: 'PDF' },
          { id: 'civil-reg', title: 'Birth Certificate Request Form', url: '#', category: 'Civil Registrar', fileSize: '310 KB', fileType: 'PDF' },
          { id: 'gad-manual', title: 'GAD-IMS Implementation Manual', url: '#', category: 'GAD', fileSize: '2.4 MB', fileType: 'PDF' },
        ];

        setDownloads(combined);
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const categories = ['all', ...Array.from(new Set(downloads.map(d => d.category)))];

  const filteredDownloads = downloads.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Business': return <Briefcase className="text-brand-primary" />;
      case 'Building': return <Building2 className="text-brand-primary" />;
      case 'Zoning': return <Landmark className="text-brand-primary" />;
      case 'GAD': return <FileCheck className="text-brand-primary" />;
      default: return <FileText className="text-brand-primary" />;
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-12 h-1 bg-brand-primary rounded-full" />
            <span className="text-sm font-bold text-brand-primary uppercase tracking-[0.3em]">Resources</span>
          </motion.div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-brand-text tracking-tight leading-none font-display">
                DOWNLOADABLES
              </h1>
              <p className="text-brand-muted mt-4 text-lg font-medium max-w-2xl">
                Access official forms, application documents, and informative materials from the Municipality of Talibon.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-brand-border rounded-2xl py-4 pl-14 pr-6 text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/30 transition-all w-full shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                  : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary/30 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Downloads Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={`skeleton-download-${i}`} className="pro-card p-8 animate-pulse">
                <div className="w-12 h-12 bg-brand-border rounded-xl mb-6" />
                <div className="h-6 bg-brand-border rounded-lg w-3/4 mb-4" />
                <div className="h-4 bg-brand-border rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="pro-card p-8 flex flex-col group hover:border-brand-primary/40"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                    {getIcon(item.category)}
                  </div>
                  <span className="text-[10px] font-black text-brand-muted bg-brand-bg px-3 py-1 rounded-full uppercase tracking-tighter">
                    {item.fileType || 'PDF'}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-brand-text mb-2 group-hover:text-brand-primary transition-colors leading-tight font-display">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-3 mt-auto pt-6 border-t border-brand-bg">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                    {item.category}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-brand-border" />
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                    {item.fileSize || 'N/A'}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full pro-button py-4 flex items-center justify-center gap-2 group/btn"
                >
                  <Download size={16} className="transition-transform group-hover/btn:-translate-y-1" />
                  <span className="text-xs font-black uppercase tracking-widest">Download File</span>
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-brand-border">
            <Search className="mx-auto text-brand-border mb-6" size={64} />
            <h3 className="text-2xl font-black text-brand-text mb-2 font-display">No files found</h3>
            <p className="text-brand-muted font-medium">No downloadable files match your current search criteria.</p>
          </div>
        )}

        {/* GAD Links Section */}
        <div className="mt-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 flex-1 bg-brand-border" />
            <h2 className="text-2xl font-black text-brand-text uppercase tracking-tight font-display text-center">
              Specialized Resource Centers
            </h2>
            <div className="h-1 flex-1 bg-brand-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="pro-card p-10 bg-brand-primary group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 text-white transform translate-x-1/4 -translate-y-1/4">
                <Target size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight font-display">GAD-IMS Portal</h3>
                <p className="text-white/80 font-medium mb-8 leading-relaxed">
                  Access comprehensive Gender and Development data, reports, and management tools for the Municipality.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/executive/gad-ims" className="bg-white text-brand-primary font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all">
                    GO TO GAD-IMS
                  </a>
                  <a href="#" className="bg-brand-primary-dark/30 text-white border border-white/20 font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                    <Download size={14} /> MANUAL
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="pro-card p-10 border-brand-primary group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary transform translate-x-1/4 -translate-y-1/4">
                <Landmark size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-brand-text mb-4 tracking-tight font-display">Legislative Archive</h3>
                <p className="text-brand-muted font-medium mb-8 leading-relaxed">
                  Browse and download enacted municipal ordinances, resolutions, and legislative documents.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/legislative/ordinances" className="bg-brand-primary text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all">
                    ORDINANCES
                  </a>
                  <a href="/legislative/resolutions" className="bg-white text-brand-text border border-brand-border font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all">
                    RESOLUTIONS
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
