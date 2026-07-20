import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import { certificateService } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface ECertificateOfIndigencyFormProps {
  onSuccess: (result: any) => void;
}

export default function ECertificateOfIndigencyForm({ onSuccess }: ECertificateOfIndigencyFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    barangay: "poblacion",
    monthlyIncome: "",
    familyMembers: "",
    purpose: "Medical Financial Assistance",
    reason: ""
  });

  const [certFile, setCertFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertFile(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) return setValidationError("Full legal name is required.");
    if (!formData.address.trim()) return setValidationError("Home address is required.");
    if (!formData.monthlyIncome.trim()) return setValidationError("Monthly family income is required.");
    if (!formData.purpose.trim()) return setValidationError("Purpose of indigency claim is required.");
    if (!certFile) return setValidationError("Please upload your signed Barangay Certificate of Indigency.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          fullName: formData.fullName,
          address: formData.address,
          barangay: formData.barangay,
          monthlyIncome: formData.monthlyIncome,
          familyMembers: formData.familyMembers,
          reason: formData.reason
        }
      });

      const payload = {
        documentType: "Certificate of Indigency",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "mswdo-social@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: serializedPurpose,
        attachments: [certFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger MSWDO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.fullName} submitted a new Certificate of Indigency application in Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "mswdo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create MSWDO notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.error("[IndigencyForm] Submit failed, using fallback", error);
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Certificate of Indigency",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "mswdo-social@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            fullName: formData.fullName,
            address: formData.address,
            barangay: formData.barangay,
            monthlyIncome: formData.monthlyIncome,
            familyMembers: formData.familyMembers,
            reason: formData.reason
          }
        }),
        attachments: [certFile].filter(Boolean) as string[],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };

      // Add to local state of citizen requests
      try {
        const saved = localStorage.getItem('talibon_citizen_requests');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: `req-${generatedId}`,
          citizenName: formData.fullName,
          type: "Certificate of Indigency",
          description: `Certificate of Indigency application submitted for ${formData.fullName} in Barangay ${formData.barangay}.`,
          submittedAt: fallbackRequest.submittedAt,
          assignedDeptId: "mswdo",
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
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-brand-text uppercase font-display tracking-tight">Certificate of Indigency Application</h2>
          <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to MSWDO Office</p>
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
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Full Legal Name of Applicant *</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Bernardo Carpio Jr."
              value={formData.fullName}
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
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Home Physical Address *</label>
            <input
              type="text"
              name="address"
              placeholder="e.g. Sitio San Roque Crossroads"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Estimated Monthly Family Income (PHP) *</label>
            <input
              type="number"
              name="monthlyIncome"
              placeholder="e.g. 5000"
              value={formData.monthlyIncome}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Purpose of Request *</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            >
              <option value="Medical Financial Assistance">Medical / Health Aid Financial Assistance</option>
              <option value="Educational Scholarship Program">Educational / Scholarship Assistance</option>
              <option value="Burial Social Service Support">Burial & Funeral Social Support</option>
              <option value="Legal Court Defense Support">PAO legal Court Assistance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Dependent Family Members</label>
            <input
              type="text"
              name="familyMembers"
              placeholder="e.g. Spouse (40), Child (12), Child (9)"
              value={formData.familyMembers}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Reason for Request / Additional Details</label>
          <textarea
            name="reason"
            rows={3}
            placeholder="Please detail any specific emergency or situational need to support MSWDO evaluation (e.g. Currently hospitalized at Bohol Provincial Hospital, needing dialysis subsidy)"
            value={formData.reason}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Required Barangay Verification Attachments</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Barangay Indigency Certification *</label>
            <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer max-w-md">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!certFile}
              />
              <File size={32} className="text-brand-primary/40 mb-2" />
              <p className="text-xs font-bold text-brand-text">
                {certFile ? "Certification Selected Successfully" : "Upload Signed Barangay Certification file"}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">Signed by Barangay Captain, up to 5MB</p>
              {certFile && (
                <span className="mt-3 px-3 py-1 bg-white rounded-lg border border-brand-border text-[9px] font-black uppercase tracking-wider text-brand-primary">
                  {certFile}
                </span>
              )}
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
            <>Submit Indigency Application <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
