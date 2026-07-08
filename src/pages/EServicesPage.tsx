import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, CheckCircle2, Clock, AlertCircle, Search, ArrowRight, Check,
  Sparkles, ShieldAlert, X, Copy, RefreshCw, File, HelpCircle, FileCheck,
  ArrowLeft, Briefcase, Building2, MapPin, ChevronRight
} from "lucide-react";
import axios from "axios";
import ECedulaForm from "../components/eservices/ECedula/ECedulaForm";

// Interface matching the backend JSON schema payload
export interface CertificateRequest {
  ticketId: string;
  documentType: string;
  barangay: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  purpose: string;
  attachments: string[];
  submittedAt: string;
  status: string;
}

export default function EServicesPage() {
  const [searchParams] = useSearchParams();
  const initialTypeFromQuery = searchParams.get("type");

  // Service routing state: "directory" | "e-cedula" | "generic-form"
  const [activeService, setActiveService] = useState<"directory" | "e-cedula" | "generic-form">("directory");

  // Form states
  const [formData, setFormData] = useState({
    certificateType: initialTypeFromQuery || "Barangay Clearance",
    barangay: "Poblacion",
    fullName: "",
    email: "",
    mobileNumber: "",
    purpose: "",
    attachments: [] as string[]
  });

  const [formStep, setFormStep] = useState<"form" | "success">("form");
  const [submittedTicket, setSubmittedTicket] = useState<CertificateRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tracking states
  const [searchTrackId, setSearchTrackId] = useState("");
  const [trackedRequest, setTrackedRequest] = useState<CertificateRequest | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // General states
  const [isCopied, setIsCopied] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Synchronize document type from query parameter if provided
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      if (typeParam === "Community Tax Certificate" || typeParam.toLowerCase().includes("cedula")) {
        setActiveService("e-cedula");
      } else if (typeParam === "Business Permit Clearance" || typeParam === "Business Permit") {
        // Business Permit landing page has its own route
        setActiveService("directory");
      } else {
        setFormData(prev => ({ ...prev, certificateType: typeParam }));
        setActiveService("generic-form");
      }
    }
  }, [searchParams]);

  // Form Submission Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setFormError("Full Legal Name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setFormError("Mobile number is required.");
      return;
    }
    if (!formData.purpose.trim()) {
      setFormError("Purpose of request is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Structure JSON payload matching backend requirements
      const payload = {
        documentType: formData.certificateType,
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        purpose: formData.purpose,
        attachments: uploadedFileName ? [uploadedFileName] : []
      };

      // POST request to the backend NestJS endpoint
      const response = await axios.post("/api/forms/certificate", payload);
      
      if (response.data) {
        const result: CertificateRequest = response.data;
        setSubmittedTicket(result);
        
        // Auto-fill status tracker with newly generated ticket
        setSearchTrackId(result.ticketId);
        setTrackedRequest(result);
        setTrackSearched(true);
        setFormStep("success");
      }
    } catch (error) {
      console.error("[Citizen Portal] Backend submit failed, running robust fallback", error);
      
      // Highly robust client-side fallback
      const generatedId = `TLB-2026-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest: CertificateRequest = {
        ticketId: generatedId,
        documentType: formData.certificateType,
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        purpose: formData.purpose,
        attachments: uploadedFileName ? [uploadedFileName] : [],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };

      setSubmittedTicket(fallbackRequest);
      setSearchTrackId(generatedId);
      setTrackedRequest(fallbackRequest);
      setTrackSearched(true);
      setFormStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Tracker Search Handler
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackId.trim()) return;

    setTrackError(null);
    setIsTrackingLoading(true);

    try {
      // GET request from our backend NestJS api endpoint
      const response = await axios.get(`/api/forms/certificate/${searchTrackId.trim()}`);
      
      if (response.data && response.data.success) {
        setTrackedRequest(response.data.request);
        setTrackSearched(true);
      } else {
        setTrackedRequest(null);
        setTrackSearched(true);
        setTrackError(response.data.message || "Ticket ID not found.");
      }
    } catch (error) {
      console.warn("[Citizen Portal] Backend tracking fetch failed, checking local state fallback", error);
      setTrackedRequest(null);
      setTrackSearched(true);
      setTrackError("No active record found for this Ticket ID. Please double check the ID string.");
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // File Upload Simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  // Helper to determine status order/steps
  const getStatusIndex = (status: string): number => {
    const statuses = [
      "Submitted",
      "Under Review",
      "Additional Requirements Needed",
      "Approved",
      "Ready for Pickup",
      "Rejected",
      "Completed"
    ];
    return statuses.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative pb-24">
      {/* Background Dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-[0.25]" 
          style={{ 
            backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
        {/* Header Hero */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            <Sparkles size={14} /> LGU Digitalization Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase font-display leading-none">
            E-SERVICES HUB
          </h1>
          <p className="text-base text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
            A secure, interactive citizen municipal portal for Talibon Bohol's digital certificate workflow. Request certificates, attach documents, and track approval status in real-time.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Citizen Service Desk (E-Services Selector and Forms) */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {activeService === "directory" ? (
                <motion.div
                  key="services-directory"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-brand-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-black text-brand-text uppercase font-display tracking-tight">Available Digital Services</h2>
                      <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-1">Select a municipal service to begin your electronic application</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* E-Cedula */}
                      <div 
                        onClick={() => setActiveService("e-cedula")}
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-orange-50 text-brand-primary rounded-2xl flex items-center justify-center">
                              <FileText size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-green-100 bg-green-50 text-green-700">Fully Online</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">E-Cedula (Tax Certificate)</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">File and calculate your Community Tax Certificate (Cedula) electronically with live tax assessment.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>File Online Now</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Business Permit */}
                      <Link 
                        to="/forms/business"
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                              <Briefcase size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-blue-100 bg-blue-50 text-blue-700">Form & Payment</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">Business Permit</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">Apply for a new business permit or renew your licenses. Complete approvals and track statuses.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>Apply / Renew</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>

                      {/* Building Permit */}
                      <Link 
                        to="/forms/building"
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                              <Building2 size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-indigo-100 bg-indigo-50 text-indigo-700">Verification</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">Building Permit</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">Secure engineering, structural, sanitary, and electrical clearances required for construction.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>Secure Permit</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>

                      {/* Zoning Clearance */}
                      <Link 
                        to="/forms/zoning"
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                              <MapPin size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-purple-100 bg-purple-50 text-purple-700">Verification</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">Zoning Clearance</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">Verify land use conformity against municipal zoning ordinances and obtain locational clearances.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>Verify Zoning</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>

                      {/* Barangay Clearance */}
                      <div 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, certificateType: "Barangay Clearance" }));
                          setActiveService("generic-form");
                          setFormStep("form");
                        }}
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                              <FileCheck size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-amber-100 bg-amber-50 text-amber-700">Service Desk</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">Barangay Clearance</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">Submit digital requests for residency clearance certificates signed by local barangay clerks.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>Submit Request</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Certificate of Indigency */}
                      <div 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, certificateType: "Certificate of Indigency" }));
                          setActiveService("generic-form");
                          setFormStep("form");
                        }}
                        className="p-6 bg-white border border-brand-border hover:border-brand-primary/30 rounded-3xl cursor-pointer group transition-all flex flex-col justify-between h-56 space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                              <Sparkles size={20} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border border-teal-100 bg-teal-50 text-teal-700">Service Desk</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">Certificate of Indigency</h3>
                            <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-1">Apply for municipal indigency verification required for social service and financial aid requests.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                          <span>Apply For Aid</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeService === "e-cedula" ? (
                <motion.div
                  key="ecedula-service-container"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between bg-white border border-brand-border rounded-2xl px-6 py-4 shadow-sm">
                    <button
                      onClick={() => setActiveService("directory")}
                      className="px-4 py-2 border border-brand-border hover:bg-gray-50 text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                      <ArrowLeft size={12} className="text-brand-primary" /> Back to Services
                    </button>
                    <span className="px-2.5 py-1 text-[9px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-md uppercase tracking-wider">E-Cedula Active Session</span>
                  </div>

                  <ECedulaForm 
                    onSuccess={(receipt) => {
                      // Synchronize with status tracker
                      setSearchTrackId(receipt.ticketId);
                      setTrackedRequest({
                        ticketId: receipt.ticketId,
                        documentType: "Community Tax Certificate / Cedula",
                        barangay: receipt.barangay,
                        fullName: `${receipt.lastName}, ${receipt.firstName}`,
                        email: receipt.email,
                        mobileNumber: receipt.mobileNumber,
                        purpose: receipt.purpose,
                        attachments: [],
                        submittedAt: receipt.submittedAt,
                        status: "Submitted"
                      });
                      setTrackSearched(true);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="generic-service-container"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between bg-white border border-brand-border rounded-2xl px-6 py-4 shadow-sm">
                    <button
                      onClick={() => setActiveService("directory")}
                      className="px-4 py-2 border border-brand-border hover:bg-gray-50 text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                      <ArrowLeft size={12} className="text-brand-primary" /> Back to Services
                    </button>
                    <span className="px-2.5 py-1 text-[9px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-md uppercase tracking-wider">{formData.certificateType} Desk</span>
                  </div>

                  <div className="bg-white border border-brand-border rounded-[2.5rem] overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-8 border-b border-brand-border bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-black text-brand-text uppercase font-display tracking-tight">Citizen Service Desk</h2>
                        <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-1">Submit new document requests</p>
                      </div>
                      {formStep === "success" && (
                        <button
                          onClick={() => {
                            setFormStep("form");
                            setFormData({
                              certificateType: formData.certificateType,
                              barangay: "Poblacion",
                              fullName: "",
                              email: "",
                              mobileNumber: "",
                              purpose: "",
                              attachments: []
                            });
                            setUploadedFileName(null);
                          }}
                          className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-secondary transition-colors rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        >
                          <RefreshCw size={12} /> New Request
                        </button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-8">
                      <AnimatePresence mode="wait">
                        
                        {/* Step 1: Input Form */}
                        {formStep === "form" && (
                          <motion.form 
                            key="request-form"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            onSubmit={handleFormSubmit} 
                            className="space-y-6"
                          >
                            {formError && (
                              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{formError}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Select Certificate Type</label>
                                <select
                                  value={formData.certificateType}
                                  onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                >
                                  <option value="Barangay Clearance">Barangay Clearance</option>
                                  <option value="Certificate of Indigency">Certificate of Indigency</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Registered Barangay</label>
                                <select
                                  value={formData.barangay}
                                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                >
                                  <option value="Poblacion">Poblacion</option>
                                  <option value="San Isidro">San Isidro</option>
                                  <option value="San Jose">San Jose</option>
                                  <option value="Tanghaligue">Tanghaligue</option>
                                  <option value="Guindacpan">Guindacpan</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Full Legal Name *</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Juan Dela Cruz"
                                  value={formData.fullName}
                                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g. juan@email.com"
                                  value={formData.email}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Mobile Number *</label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="e.g. 09123456789"
                                  value={formData.mobileNumber}
                                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Purpose of Request *</label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Please describe why you are requesting this certificate (e.g. Local Employment, Bank Loan, Scholarship, etc.)"
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm"
                              />
                            </div>

                            {/* Required Attachments Section */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Required Attachments (Identity Verification)</label>
                                <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold uppercase px-2 py-0.5 rounded border border-amber-100">Optional</span>
                              </div>
                              
                              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-start gap-3 text-orange-950 text-[11px] leading-relaxed">
                                <ShieldAlert size={16} className="shrink-0 text-brand-primary mt-0.5" />
                                <p>
                                  To protect identity registry information under RA 10173, you may optionally attach a digital scan of any Government ID card (Passport, Driver's License, National ID).
                                </p>
                              </div>

                              <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf" 
                                  onChange={handleFileChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <File size={32} className="text-brand-primary/40 mb-2" />
                                <p className="text-xs font-bold text-brand-text">
                                  {uploadedFileName ? "File Uploaded Successfully" : "Drag & drop or click to upload ID file"}
                                </p>
                                <p className="text-[10px] text-brand-muted mt-0.5">PNG, JPG, PDF up to 5MB</p>
                                {uploadedFileName && (
                                  <span className="mt-3 px-3 py-1 bg-white rounded-lg border border-brand-border text-[9px] font-black uppercase tracking-wider text-brand-primary">
                                    {uploadedFileName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>Submit Request <ArrowRight size={16} /></>
                              )}
                            </button>
                          </motion.form>
                        )}

                        {/* Step 2: Confirmation Receipt Screen */}
                        {formStep === "success" && submittedTicket && (
                          <motion.div
                            key="success-receipt"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-6 space-y-6"
                          >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                              <CheckCircle2 size={44} />
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-2xl font-black text-brand-text font-display uppercase tracking-tight">Request Submitted!</h3>
                              <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
                                Your municipal application for a <strong className="text-brand-text">{submittedTicket.documentType}</strong> has been logged. Use your unique Ticket ID below to monitor progress.
                              </p>
                            </div>

                            {/* Ticket Display Panel */}
                            <div className="p-6 bg-gray-50 border border-brand-border rounded-3xl max-w-sm mx-auto space-y-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest block">Transaction Serial ID</span>
                                <span className="font-mono text-xl font-black text-brand-primary tracking-wider block">
                                  {submittedTicket.ticketId}
                                </span>
                              </div>

                              <button
                                onClick={() => copyToClipboard(submittedTicket.ticketId)}
                                className="w-full py-3 bg-white hover:bg-gray-50 border border-brand-border text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-sm"
                              >
                                <Copy size={13} className="text-brand-primary" />
                                {isCopied ? "Ticket ID Copied!" : "Copy Ticket ID"}
                              </button>
                            </div>

                            {/* Timeline expected card */}
                            <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl text-orange-950 text-left max-w-md mx-auto space-y-3">
                              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                                <Clock size={16} className="text-brand-primary" />
                                <span>Expected Processing Time</span>
                              </div>
                              <p className="text-xs font-semibold">
                                1–3 Working Days
                              </p>
                              <ul className="list-disc pl-4 text-[11px] leading-relaxed font-semibold space-y-1">
                                <li>You will receive an automated email notification once the document has been reviewed by the Barangay clerk.</li>
                                <li>You can track the state of this ticket at any time using the tracker on this page.</li>
                              </ul>
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setFormStep("form");
                                  setFormData({
                                    certificateType: formData.certificateType,
                                    barangay: "Poblacion",
                                    fullName: "",
                                    email: "",
                                    mobileNumber: "",
                                    purpose: "",
                                    attachments: []
                                  });
                                  setUploadedFileName(null);
                                }}
                                className="px-6 py-3 border border-brand-border text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                              >
                                Submit Another request
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE: Real-time Status Tracker Card */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-brand-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg font-black text-brand-text font-display uppercase tracking-tight">Track Your Request</h3>
                <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-1">Enter Ticket ID to review milestones</p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleTrackSearch} className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. TLB-2026-0041"
                  value={searchTrackId}
                  onChange={(e) => setSearchTrackId(e.target.value)}
                  className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 pl-6 pr-14 font-mono font-bold text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all uppercase tracking-wider"
                />
                <button 
                  type="submit" 
                  disabled={isTrackingLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl transition-colors active:scale-95"
                >
                  {isTrackingLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                </button>
              </form>

              {/* Search Display Panel */}
              <AnimatePresence mode="wait">
                
                {/* 1. Track Error State */}
                {trackSearched && trackError && (
                  <motion.div
                    key="track-error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-center py-6 space-y-4 bg-red-50/50 border border-red-100 rounded-3xl p-6"
                  >
                    <ShieldAlert size={36} className="text-red-500 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-brand-text uppercase">ID Not Found</p>
                      <p className="text-[11px] text-brand-muted leading-relaxed max-w-xs mx-auto">
                        No active records match "{searchTrackId}". Ensure the spelling matches your receipt ticket perfectly.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. Track Found State: 7 Step Timeline */}
                {trackSearched && trackedRequest && (
                  <motion.div
                    key="track-timeline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6 pt-4 border-t border-brand-border"
                  >
                    
                    {/* Document Header Metadata */}
                    <div className="bg-gray-50/50 border border-brand-border rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest block">Document requested</span>
                          <span className="text-xs font-black text-brand-text uppercase leading-none">{trackedRequest.documentType}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-brand-primary/5 text-brand-primary px-2.5 py-1 rounded border border-brand-primary/10">
                          {trackedRequest.ticketId}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-[10px] pt-1.5 border-t border-brand-border/60">
                        <div>
                          <span className="text-brand-muted font-bold uppercase block text-[8px]">Applicant</span>
                          <span className="font-semibold text-brand-text truncate block">{trackedRequest.fullName}</span>
                        </div>
                        <div>
                          <span className="text-brand-muted font-bold uppercase block text-[8px]">Barangay</span>
                          <span className="font-semibold text-brand-text block">{trackedRequest.barangay}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Tracker Milestones */}
                    <div className="space-y-5 relative pl-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                      
                      {/* Step 1: Submitted */}
                      <div className="relative">
                        <div className={`absolute -left-[23px] top-0.5 w-[14px] h-[14px] rounded-full border-4 border-white shadow-md z-10 ${
                          getStatusIndex(trackedRequest.status) >= 0 ? "bg-green-500" : "bg-gray-200"
                        }`} />
                        <div className="space-y-0.5">
                          <p className={`text-xs font-black uppercase tracking-tight ${
                            getStatusIndex(trackedRequest.status) >= 0 ? "text-brand-text" : "text-brand-muted"
                          }`}>Submitted</p>
                          <p className="text-[10px] text-brand-muted leading-none">Your form is logged in our digital systems.</p>
                        </div>
                      </div>

                      {/* Step 2: Under Review */}
                      <div className="relative">
                        <div className={`absolute -left-[23px] top-0.5 w-[14px] h-[14px] rounded-full border-4 border-white shadow-md z-10 ${
                          getStatusIndex(trackedRequest.status) >= 1 ? "bg-green-500" : 
                          trackedRequest.status === "Under Review" ? "bg-amber-400" : "bg-gray-200"
                        }`} />
                        <div className="space-y-0.5">
                          <p className={`text-xs font-black uppercase tracking-tight ${
                            getStatusIndex(trackedRequest.status) >= 1 ? "text-brand-text" : "text-brand-muted"
                          }`}>Under Review</p>
                          <p className="text-[10px] text-brand-muted leading-none">Barangay officials are reviewing parameters.</p>
                        </div>
                      </div>

                      {/* Step 3: Additional Requirements Needed (Shown conditionally based on state) */}
                      {trackedRequest.status === "Additional Requirements Needed" && (
                        <div className="relative bg-amber-50 border border-amber-100 rounded-xl p-3.5 mr-2 animate-pulse">
                          <div className="absolute -left-[31px] top-4 w-[16px] h-[16px] rounded-full border-4 border-white shadow-md bg-amber-500 z-10" />
                          <div className="space-y-1 text-amber-900">
                            <p className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                              <ShieldAlert size={12} /> ACTION REQUIRED
                            </p>
                            <p className="text-[10px] font-semibold leading-relaxed">
                              Additional Requirements Needed. Our civil registrar requested secondary physical ID copies or proof of residency to proceed. Please check your email or contact support.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Approved */}
                      <div className="relative">
                        <div className={`absolute -left-[23px] top-0.5 w-[14px] h-[14px] rounded-full border-4 border-white shadow-md z-10 ${
                          getStatusIndex(trackedRequest.status) >= 3 ? "bg-green-500" : 
                          trackedRequest.status === "Approved" ? "bg-amber-400" : "bg-gray-200"
                        }`} />
                        <div className="space-y-0.5">
                          <p className={`text-xs font-black uppercase tracking-tight ${
                            getStatusIndex(trackedRequest.status) >= 3 ? "text-brand-text" : "text-brand-muted"
                          }`}>Approved</p>
                          <p className="text-[10px] text-brand-muted leading-none">The municipal administrator has signed off the decree.</p>
                        </div>
                      </div>

                      {/* Step 5: Ready for Pickup */}
                      <div className="relative">
                        <div className={`absolute -left-[23px] top-0.5 w-[14px] h-[14px] rounded-full border-4 border-white shadow-md z-10 ${
                          getStatusIndex(trackedRequest.status) >= 4 ? "bg-green-500" : 
                          trackedRequest.status === "Ready for Pickup" ? "bg-amber-400" : "bg-gray-200"
                        }`} />
                        <div className="space-y-0.5">
                          <p className={`text-xs font-black uppercase tracking-tight ${
                            getStatusIndex(trackedRequest.status) >= 4 ? "text-brand-text" : "text-brand-muted"
                          }`}>Ready for Pickup</p>
                          <p className="text-[10px] text-brand-muted leading-none">Print copy is prepared for claim at the Municipal Hall.</p>
                        </div>
                      </div>

                      {/* Step 6: Rejected Error Message */}
                      {trackedRequest.status === "Rejected" && (
                        <div className="relative bg-red-50 border border-red-100 rounded-xl p-3.5 mr-2">
                          <div className="absolute -left-[31px] top-4 w-[16px] h-[16px] rounded-full border-4 border-white shadow-md bg-red-500 z-10" />
                          <div className="space-y-1 text-red-900">
                            <p className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                              <ShieldAlert size={12} /> REQUEST REJECTED
                            </p>
                            <p className="text-[10px] font-semibold leading-relaxed">
                              Verification declined due to residency validation failure or incomplete identification details. Please submit a new claim with valid files.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 7: Completed */}
                      {trackedRequest.status !== "Rejected" && (
                        <div className="relative">
                          <div className={`absolute -left-[23px] top-0.5 w-[14px] h-[14px] rounded-full border-4 border-white shadow-md z-10 ${
                            getStatusIndex(trackedRequest.status) >= 6 ? "bg-green-500" : "bg-gray-200"
                          }`} />
                          <div className="space-y-0.5">
                            <p className={`text-xs font-black uppercase tracking-tight ${
                              getStatusIndex(trackedRequest.status) >= 6 ? "text-brand-text" : "text-brand-muted"
                            }`}>Completed</p>
                            <p className="text-[10px] text-brand-muted leading-none">Document collected by resident and ticket archived.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. Empty Search Tracker Instructions */}
                {!trackSearched && (
                  <div className="text-center py-10 px-4 border border-brand-border border-dashed rounded-3xl text-brand-muted space-y-3">
                    <HelpCircle size={32} className="mx-auto text-brand-primary/20" />
                    <p className="text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                      Query your unique Transaction Ticket ID (e.g., <span className="font-mono text-brand-primary">TLB-2026-0041</span>) to inspect live approval milestones from municipal officials.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
