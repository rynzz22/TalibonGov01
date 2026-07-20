import React, { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, AlertCircle, ShieldAlert, File, ArrowRight, ShieldCheck } from "lucide-react";
import { certificateService } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EBusinessPermitFormProps {
  onSuccess: (result: any) => void;
}

export default function EBusinessPermitForm({ onSuccess }: EBusinessPermitFormProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessAddress: "",
    barangay: "poblacion",
    natureOfBusiness: "",
    dtiSecRegNo: "",
    contactNumber: "",
    email: "",
    purpose: "New Business Permit Registration"
  });

  const [dtiFile, setDtiFile] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: "dti" | "id") => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (fileType === "dti") {
        setDtiFile(fileName);
      } else {
        setIdFile(fileName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validation
    if (!formData.businessName.trim()) return setValidationError("Business name is required.");
    if (!formData.ownerName.trim()) return setValidationError("Owner / Applicant name is required.");
    if (!formData.businessAddress.trim()) return setValidationError("Business location address is required.");
    if (!formData.natureOfBusiness.trim()) return setValidationError("Nature of business is required.");
    if (!formData.contactNumber.trim()) return setValidationError("Contact number is required.");
    if (!formData.email.trim() || !formData.email.includes("@")) return setValidationError("A valid email address is required.");
    if (!dtiFile) return setValidationError("Please upload your DTI/SEC Registration Certificate.");
    if (!idFile) return setValidationError("Please upload a valid government-issued ID.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          businessAddress: formData.businessAddress,
          barangay: formData.barangay,
          natureOfBusiness: formData.natureOfBusiness,
          dtiSecRegNo: formData.dtiSecRegNo,
          contactNumber: formData.contactNumber,
          email: formData.email
        }
      });

      const payload = {
        documentType: "Business Permit",
        barangay: formData.barangay,
        fullName: formData.ownerName,
        email: formData.email,
        mobileNumber: formData.contactNumber,
        purpose: serializedPurpose,
        attachments: [dtiFile, idFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger BPLO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.ownerName} submitted a new Business Permit application for ${formData.businessName}.`,
            category: "Citizen Applications",
            department_id: "bplo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create BPLO notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.error("[BusinessPermitForm] Submit failed, using robust fallback", error);
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Business Permit",
        barangay: formData.barangay,
        fullName: formData.ownerName,
        email: formData.email,
        mobileNumber: formData.contactNumber,
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            businessAddress: formData.businessAddress,
            barangay: formData.barangay,
            natureOfBusiness: formData.natureOfBusiness,
            dtiSecRegNo: formData.dtiSecRegNo,
            contactNumber: formData.contactNumber,
            email: formData.email
          }
        }),
        attachments: [dtiFile, idFile].filter(Boolean) as string[],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };

      // Add to local state of citizen requests
      try {
        const saved = localStorage.getItem('talibon_citizen_requests');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: `req-${generatedId}`,
          citizenName: formData.ownerName,
          type: "Business Permit",
          description: `Business Permit application submitted for ${formData.businessName} in Barangay ${formData.barangay}.`,
          submittedAt: fallbackRequest.submittedAt,
          assignedDeptId: "bplo",
          status: "PENDING",
          priority: "HIGH",
          trackingNumber: generatedId,
          attachments: fallbackRequest.attachments
        });
        localStorage.setItem('talibon_citizen_requests', JSON.stringify(list));
      } catch (e) {
        console.error("Failed to sync fallback requests to localStorage", e);
      }

      onSuccess(fallbackRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-brand-border bg-gray-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <Briefcase size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-brand-text uppercase font-display tracking-tight">Business Permit Unified Application</h2>
          <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to BPLO</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
        {validationError && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Registered Business Name *</label>
            <input
              type="text"
              name="businessName"
              placeholder="e.g. Bohol Divers Beach Resort"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Owner / Registrant Full Name *</label>
            <input
              type="text"
              name="ownerName"
              placeholder="e.g. Jose Rizal Macalinao"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Nature of Business *</label>
            <input
              type="text"
              name="natureOfBusiness"
              placeholder="e.g. Resort & Hotel Operations, Retail Store"
              value={formData.natureOfBusiness}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">DTI or SEC Registration Number</label>
            <input
              type="text"
              name="dtiSecRegNo"
              placeholder="e.g. DTI-BHL-481903 (Optional)"
              value={formData.dtiSecRegNo}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Business Physical Address *</label>
            <input
              type="text"
              name="businessAddress"
              placeholder="e.g. Sitio Divers, Sandingan Coast"
              value={formData.businessAddress}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Registered Barangay *</label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            >
              {BARANGAYS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Mobile Contact Number *</label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="e.g. 09123456789"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. owner@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Required Attachments (Identity & Business Legitimacy)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">DTI or SEC Registration Certificate *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "dti")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!dtiFile}
                />
                <File size={24} className="text-brand-primary/40 mb-1" />
                <p className="text-[11px] font-bold text-brand-text">
                  {dtiFile ? "Certificate Selected" : "Upload DTI / SEC Registration"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF or Image up to 5MB</p>
                {dtiFile && (
                  <span className="mt-2 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {dtiFile}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Valid Government-issued ID *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "id")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!idFile}
                />
                <File size={24} className="text-brand-primary/40 mb-1" />
                <p className="text-[11px] font-bold text-brand-text">
                  {idFile ? "ID Uploaded Successfully" : "Upload Owner Valid ID"}
                </p>
                <p className="text-[9px] text-brand-muted">Passport, Driver's, National ID</p>
                {idFile && (
                  <span className="mt-2 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {idFile}
                  </span>
                )}
              </div>
            </div>
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
            <>Submit Business Application <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
