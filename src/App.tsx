/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ContentPage from "./pages/ContentPage";
import OfficialSealPage from "./pages/OfficialSealPage";
import EnactedOrdinancesPage from "./pages/EnactedOrdinancesPage";
import ResolutionsPage from "./pages/ResolutionsPage";
import CitizenCharterPage from "./pages/CitizenCharterPage";
import FullDisclosurePage from "./pages/FullDisclosurePage";
import BusinessPermitPage from "./pages/BusinessPermitPage";
import BuildingPermitPage from "./pages/BuildingPermitPage";
import ZoningClearancePage from "./pages/ZoningClearancePage";
import OrganizationalChartPage from "./pages/OrganizationalChartPage";
import UpdatesPage from "./pages/UpdatesPage";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import DownloadsPage from "./pages/DownloadsPage";
import BarangayHome from "./pages/BarangayHome";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import EServicesPage from "./pages/EServicesPage";
import { BARANGAYS } from "./constants/barangayConfig";
import AdminDashboard from "./pages/AdminDashboard";
import GadImsSystem from "./components/GadImsSystem";
import TourismMapPage from "./pages/TourismMapPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Footer from "./components/Footer";
import GeminiAssistant from "./components/GeminiAssistant";
import ScrollToTop from "./components/ScrollToTop";
import { aboutApi, executiveApi, legislativeApi, transparencyApi, tourismApi, formsApi } from "./services/api";
import { AuthProvider } from "./contexts/SupabaseAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Eye, Target, Quote, User, Phone, ExternalLink, Clock, Building2, ArrowUpRight } from "lucide-react";

import LocationMap from "./components/LocationMap";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-primary selection:text-white relative overflow-hidden">
        {/* Minimal Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative z-10">
          {!isLogin && <Navbar />}
          <div className={isHome || isLogin ? "" : "pt-[180px] lg:pt-[260px]"}>
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/e-services" element={<EServicesPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/brgy/:slug" element={<BarangayHome />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/tourism/map" element={<TourismMapPage />} />
          <Route path="/news/updates" element={<UpdatesPage />} />
          
          {/* About Talibon */}
          <Route path="/about/profile" element={<ContentPage title="Brief Profile" fetchData={aboutApi.getProfile} renderContent={(data) => <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">{data.content}</p>} />} />
          <Route path="/about/seal" element={<OfficialSealPage />} />
          <Route path="/about/history" element={<ContentPage title="Brief History" fetchData={aboutApi.getHistory} renderContent={(data) => (
            <div className="space-y-12">
              <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line bg-brand-primary/5 p-8 rounded-2xl border-l-4 border-brand-primary mb-16">{data.content}</p>
              
              <div className="relative max-w-4xl mx-auto pl-8 md:pl-0">
                {/* Timeline Line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-border md:-translate-x-1/2" />
                
                <div className="space-y-24">
                  {data.timeline?.map((event: any, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-0 md:left-1/2 top-2 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-brand-primary border-4 border-white shadow-lg z-10" />
                      
                      <div className="w-full md:w-1/2 text-right">
                        <div className={`space-y-2 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} pl-8 md:pl-0`}>
                          <span className="text-4xl font-black text-brand-primary/20 font-display italic tracking-tighter">
                            {event.year}
                          </span>
                          <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight leading-none group-hover:text-brand-primary transition-colors">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/2">
                        <div className="p-6 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-all group">
                          <p className="text-sm text-brand-muted leading-relaxed font-medium">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )} />} />
          <Route path="/about/mayors" element={<ContentPage title="List of Mayors" fetchData={aboutApi.getMayors} renderContent={(data) => (
            <div className="space-y-12">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((section: any, idx: number) => (
                  <div key={idx} className="space-y-6">
                    <div className="border-b-2 border-brand-primary/20 pb-4">
                      <h2 className="text-3xl font-extrabold text-brand-text font-display">
                        {section.section}
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.mayors.map((mayor: any, mIdx: number) => (
                        <div key={mIdx} className="civic-card p-6 group">
                          <h3 className="text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors">{mayor.name}</h3>
                          {mayor.term && (
                            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-2 bg-brand-primary/5 inline-block px-2 py-1 rounded">
                              TERM: {mayor.term}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {section.commentary && (
                      <div className="p-8 bg-brand-primary/5 border-l-4 border-brand-primary rounded-r-2xl relative overflow-hidden group">
                        <Quote size={48} className="absolute -top-4 -left-4 text-brand-primary/10" />
                        <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
                          Historical Commentary
                        </p>
                        <p className="text-xl text-brand-text font-medium leading-relaxed italic">
                          "{section.commentary.content}"
                        </p>
                        <p className="text-sm font-bold text-brand-muted text-right mt-6">
                          — {section.commentary.source}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
                  No data available.
                </div>
              )}
            </div>
          )} />} />
          <Route path="/about/departments" element={<ContentPage title="Departments" fetchData={aboutApi.getDepartments} renderContent={(data) => (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((dept: any, idx: number) => {
                    const isWide = idx === 0 || idx === 3;
                    return (
                      <motion.div 
                        key={`${dept.name}-${idx}`} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group relative overflow-hidden bg-white border border-brand-border rounded-3xl p-8 hover:border-brand-primary transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 ${isWide ? 'md:col-span-2' : ''}`}
                      >
                        {/* Background Code Decor */}
                        <div className="absolute top-4 right-4 font-mono text-[8px] opacity-10 group-hover:opacity-30 transition-opacity select-none pointer-events-none uppercase tracking-tighter text-right">
                          <div className="text-brand-primary">DEPT_ID: {idx.toString().padStart(3, '0')}</div>
                          <div>MUNICIPAL_CODE: 071221</div>
                          <div>COORD: 10.15N/124.33E</div>
                        </div>

                        <div className="relative z-10 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            {dept.logoUrl && (
                              <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-brand-border">
                                <img 
                                  src={dept.logoUrl} 
                                  alt="" 
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <div className="px-3 py-1 bg-brand-primary/5 text-brand-primary text-[8px] font-black rounded-full border border-brand-primary/10 tracking-[0.2em] uppercase">
                              {dept.type}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight leading-none mb-3 group-hover:text-brand-primary transition-colors">
                              {dept.name}
                            </h3>
                            <p className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-widest mb-6 border-l-2 border-brand-primary/20 pl-3">
                              {dept.officialName}
                            </p>
                            <p className="text-sm text-brand-muted leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                              {dept.description}
                            </p>
                          </div>

                          <div className="pt-6 border-t border-brand-border mt-auto">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest block opacity-60">Director / Head</span>
                                <div className="flex items-center gap-2 text-xs font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                  <User size={12} className="shrink-0" />
                                  <span className="truncate">{dept.head || "OIC"}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest block opacity-60">Operations</span>
                                <div className="flex items-center gap-2 text-xs font-black text-brand-text uppercase tracking-tight">
                                  <Phone size={12} className="shrink-0 text-brand-primary" />
                                  <span className="truncate">{dept.contact || "-"}</span>
                                </div>
                              </div>
                            </div>

                            <a 
                              href={dept.serviceLink || "/about/services"}
                              className="mt-6 w-full flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-4 bg-gray-50 group-hover:bg-brand-text group-hover:text-white rounded-2xl transition-all"
                            >
                              ACCESS SERVICES <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>

                        {/* Large Background Icon */}
                        <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none select-none">
                          <Building2 size={200} />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
                    No departments found in technical database.
                  </div>
                )}
              </div>
            </div>
          )} />} />
          <Route path="/about/barangays" element={<ContentPage title="Barangay Profiles" fetchData={async () => ({ data: BARANGAYS })} renderContent={(data) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((brgy: any, idx: number) => (
                  <Link 
                    key={`${brgy.slug}-${idx}`} 
                    to={`/brgy/${brgy.slug}`}
                    className="minimal-card p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-brand-primary/30 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-brand-text group-hover:text-brand-primary transition-colors">{brgy.name}</h3>
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1">Captain: {brgy.captain}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                      Visit Microsite <ArrowUpRight size={12} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
                  No barangays found.
                </div>
              )}
            </div>
          )} />} />
          <Route path="/about/demographics" element={<ContentPage title="Demographics" fetchData={aboutApi.getDemographics} renderContent={(data) => (
            <div className="space-y-12">
              <p className="text-lg text-brand-muted leading-relaxed font-medium">{data?.content}</p>
              {data.images && Array.isArray(data.images) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-square bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden hover:scale-105 transition-transform duration-500">
                      <img src={img} alt={`Demographics ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )} />} />
          <Route path="/about/location" element={<ContentPage title="Location" fetchData={aboutApi.getLocation} renderContent={(data) => (
            <div className="space-y-8">
              <div className="relative aspect-video bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden group z-0">
                <LocationMap 
                  lat={data.lat || 10.1517} 
                  lng={data.lng || 124.3333} 
                  title="Talibon Bohol" 
                  logoUrl={data.logoUrl} 
                />
              </div>
              
              <div className="p-8 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">{data?.description}</p>
              </div>
            </div>
          )} />} />
          <Route path="/about/vicinity" element={<ContentPage title="Vicinity Map" fetchData={aboutApi.getVicinityMap} renderContent={(data) => (
            <div className="space-y-8">
              <div className="aspect-video bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                <img src={data.url} alt={data.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <p className="text-lg text-brand-muted leading-relaxed font-medium">{data?.description}</p>
            </div>
          )} />} />
          <Route path="/about/industry" element={<ContentPage title="Industry" fetchData={aboutApi.getIndustry} renderContent={(data) => <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">{data.content}</p>} />} />
          <Route path="/about/services" element={<ContentPage title="Government Services" fetchData={aboutApi.getServices} renderContent={(data) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(data) && data.map((service: any, idx: number) => (
                <div key={`${service.name}-${idx}`} className="civic-card p-8 group">
                  <h3 className="text-xl font-bold text-brand-text mb-4 group-hover:text-brand-primary transition-colors">{String(service.name)}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{String(service?.description || "")}</p>
                </div>
              ))}
            </div>
          )} />} />
          <Route path="/about/hymn" element={<ContentPage title="Talibon Hymn" fetchData={aboutApi.getHymn} renderContent={(data) => (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-brand-text font-display uppercase tracking-tight">{data.title || "Talibon Hymn"}</h2>
                <p className="text-sm font-black text-brand-primary uppercase tracking-[0.3em]">BY: {data.author || "Norman Ingking"}</p>
              </div>
              
              {data.imageUrl ? (
                <div className="bg-white rounded-3xl border-4 border-white shadow-2xl p-8 overflow-hidden">
                  <img 
                    src={data.imageUrl} 
                    alt="Talibon Hymn Lyrics" 
                    className="w-full h-auto rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="civic-card p-12 bg-white text-center">
                  <div className="prose prose-blue max-w-none mx-auto">
                    {data.lyrics?.split('\n\n').map((paragraph: string, idx: number) => (
                      <div key={idx} className="mb-8 last:mb-0">
                        {paragraph.split('\n').map((line: string, lIdx: number) => (
                          <p key={lIdx} className="text-xl text-brand-text font-bold leading-tight mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )} />} />

          {/* Executive */}
          <Route path="/executive/mandate" element={<ContentPage title="Executive Mandate" fetchData={executiveApi.getMandate} renderContent={(data) => <p className="text-lg text-brand-muted leading-relaxed font-medium">{data.content}</p>} />} />
          <Route path="/executive/vision-mission" element={<ContentPage title="Vision & Mission" fetchData={executiveApi.getVisionMission} renderContent={(data) => (
            <div className="space-y-12">
              <div className="p-10 civic-card bg-brand-primary/5 border-l-8 border-brand-primary relative overflow-hidden">
                <Eye size={48} className="absolute -top-4 -left-4 text-brand-primary/10" />
                <h3 className="text-xs font-extrabold text-brand-primary mb-6 uppercase tracking-[0.3em]">Vision</h3>
                <p className="text-2xl text-brand-text font-bold leading-tight italic">"{data.vision}"</p>
              </div>
              <div className="p-10 civic-card bg-brand-accent/5 border-l-8 border-brand-accent relative overflow-hidden">
                <Target size={48} className="absolute -top-4 -left-4 text-brand-accent/10" />
                <h3 className="text-xs font-extrabold text-brand-accent mb-6 uppercase tracking-[0.3em]">Mission</h3>
                <p className="text-2xl text-brand-text font-bold leading-tight italic">"{data.mission}"</p>
              </div>
            </div>
          )} />} />
          <Route path="/executive/chart" element={<OrganizationalChartPage />} />
          <Route path="/executive/directory" element={<ContentPage title="Directory of Departments" fetchData={executiveApi.getDirectory} renderContent={(data) => (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((dept: any, idx: number) => (
                  <div key={`${dept.department}-${idx}`} className="flex justify-between items-center p-6 civic-card group">
                    <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">{dept.department}</h3>
                    <p className="text-lg font-bold text-brand-primary">{dept.contact}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
                  No directory entries found.
                </div>
              )}
            </div>
          )} />} />
          <Route path="/executive/gad-ims" element={<ContentPage title="Talibon GAD-IMS" fetchData={executiveApi.getGadIms} renderContent={(data) => <GadImsSystem data={data} />} />} />

          {/* Legislative */}
          <Route path="/legislative/mandate" element={<ContentPage title="Legislative Mandate" fetchData={legislativeApi.getMandate} renderContent={(data) => <p className="text-lg text-brand-muted leading-relaxed font-medium">{data.content}</p>} />} />
          <Route path="/legislative/structure" element={<ContentPage title="Organizational Structure" fetchData={legislativeApi.getStructure} renderContent={(data) => (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl border-4 border-white shadow-2xl p-8 overflow-hidden">
                <img 
                  src={data.imageUrl} 
                  alt="Legislative Organizational Structure" 
                  className="w-full h-auto rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )} />} />
          <Route path="/legislative/ordinances" element={<EnactedOrdinancesPage />} />
          <Route path="/legislative/resolutions" element={<ResolutionsPage />} />

          {/* News */}
          <Route path="/news/view/:id" element={<NewsDetailPage />} />
          <Route path="/news/:category" element={<NewsCategoryPage />} />

          {/* Transparency */}
          <Route path="/transparency/charter" element={<CitizenCharterPage />} />
          <Route path="/transparency/disclosure" element={<FullDisclosurePage />} />
          <Route path="/transparency/infrastructure" element={<ContentPage title="Infrastructure Projects" fetchData={transparencyApi.getInfrastructure} renderContent={(data) => (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(data) && data.map((project: any, idx: number) => (
                <div key={`${project.id}-${idx}`} className="civic-card p-8 group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">{String(project.title)}</h3>
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                      {String(project.status)}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">BUDGET: <span className="text-brand-primary">{String(project.budget)}</span></p>
                </div>
              ))}
            </div>
          )} />} />
          <Route path="/transparency/finance" element={<ContentPage title="Finance Reports" fetchData={transparencyApi.getFinanceReports} renderContent={(data) => (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(data) && data.map((report: any, idx: number) => (
                <a key={`${report.id}-${idx}`} href={report.url} className="flex items-center justify-between p-6 civic-card group hover:bg-brand-primary/5 transition-all duration-300">
                  <span className="text-lg font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">{String(report.title)}</span>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-full">VIEW REPORT</span>
                </a>
              ))}
            </div>
          )} />} />
          <Route path="/transparency/orders" element={<ContentPage title="Executive Orders" fetchData={transparencyApi.getExecutiveOrders} renderContent={(data) => (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(data) && data.map((order: any, idx: number) => (
                <div key={`${order.id}-${idx}`} className="civic-card p-8 group">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{String(order.date)}</p>
                  <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">{String(order.title)}</h3>
                </div>
              ))}
            </div>
          )} />} />
          <Route path="/transparency/budget" element={<ContentPage title="Budget and Finances" fetchData={transparencyApi.getBudget} renderContent={(data) => (
            <div className="space-y-12">
              <div className="p-12 bg-brand-primary text-white rounded-[2.5rem] shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-80">Annual Budget</h3>
                <p className="text-6xl font-black tracking-tighter leading-none font-display uppercase">{String(data.annualBudget)}</p>
                <span className="absolute -bottom-8 -right-8 text-9xl font-black text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  PHP
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.isArray(data.breakdown) && data.breakdown.map((item: any, idx: number) => (
                  <div key={`${item.category}-${idx}`} className="civic-card p-8 group hover:-translate-y-1">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-2 group-hover:text-brand-primary transition-colors">{String(item.category)}</p>
                    <p className="text-2xl font-black text-brand-text font-display uppercase">{String(item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )} />} />
          <Route path="/transparency/biddings" element={<ContentPage title="Biddings" fetchData={transparencyApi.getBiddings} renderContent={(data) => (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(data) && data.map((bid: any, idx: number) => (
                <div key={`${bid.id}-${idx}`} className="civic-card p-8 group">
                  <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors mb-4 font-display uppercase tracking-tight">{String(bid.title)}</h3>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-full inline-block">DEADLINE: {String(bid.deadline)}</p>
                </div>
              ))}
            </div>
          )} />} />

          {/* Tourism */}
          <Route path="/tourism/spots" element={<ContentPage title="Tourist Spots" fetchData={tourismApi.getSpots} renderContent={(data) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.isArray(data) && data.map((spot: any, idx: number) => (
                <div key={`${spot.id}-${idx}`} className="group">
                  <div className="aspect-square bg-brand-surface rounded-[2.5rem] mb-6 overflow-hidden border-4 border-white shadow-2xl relative">
                    <img src={`https://picsum.photos/seed/spot${spot.id}/800/800`} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-text mb-3 group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">{String(spot.name)}</h3>
                  <p className="text-brand-muted text-sm font-medium leading-relaxed">{String(spot?.description || "")}</p>
                </div>
              ))}
            </div>
          )} />} />
          <Route path="/tourism/festivities" element={<ContentPage title="Festivities" fetchData={tourismApi.getFestivities} renderContent={(data) => (
            <div className="space-y-16">
              {Array.isArray(data) && data.map((fest: any, idx: number) => (
                <div key={`${fest.name}-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center group">
                  <div className="aspect-square bg-brand-surface rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
                    <img src={`https://picsum.photos/seed/${fest.name}/800/800`} alt={fest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] bg-brand-primary/10 px-4 py-2 rounded-full inline-block">{fest.date}</p>
                    <h3 className="text-4xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight leading-none">{fest.name}</h3>
                    <p className="text-lg text-brand-muted leading-relaxed font-medium">{fest?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )} />} />
          <Route path="/tourism/delicacies" element={<ContentPage title="Local Delicacies" fetchData={tourismApi.getDelicacies} renderContent={(data) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(data) && data.map((item: any, idx: number) => (
                <div key={`${item.name}-${idx}`} className="civic-card p-8 group hover:-translate-y-2">
                  <div className="aspect-square bg-brand-bg rounded-[2rem] mb-6 overflow-hidden border-2 border-brand-primary/5 shadow-inner">
                    <img src={`https://picsum.photos/seed/${item.name}/400/400`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-black text-brand-text mb-3 group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">{item.name}</h3>
                  <p className="text-brand-muted text-sm font-medium leading-relaxed line-clamp-3">{item?.description}</p>
                </div>
              ))}
            </div>
          )} />} />

          {/* Forms */}
          <Route path="/forms/business" element={<BusinessPermitPage />} />
          <Route path="/forms/building" element={<BuildingPermitPage />} />
          <Route path="/forms/zoning" element={<ZoningClearancePage />} />
        </Routes>
          </div>
          <Footer />
          <GeminiAssistant />
        </div>
      </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

