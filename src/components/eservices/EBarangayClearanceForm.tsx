import React, { useState } from "react";
import { motion } from "motion/react";
import { FileCheck, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import axios from "axios";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EBarangayClearanceFormProps {
  onSuccess: (result: any) => void;
}

export default function EBarangayClearanceForm({ onSuccess }: EBarangayClearanceFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    barangay: "poblacion",
    sitioPurok: "",
    yearsOfResidency: "",
    purpose: "Local Employment"
  });

  const [idFile, setIdFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdFile(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) return setValidationError("Full legal name is required.");
    if (!formData.sitioPurok.trim()) return setValidationError("Sitio / Purok is required.");
    if (!formData.yearsOfResidency.trim()) return setValidationError("Years of residency is required.");
    if (!formData.purpose.trim()) return setValidationError("Purpose of clearance is required.");
    if (!idFile) return setValidationError("Please upload a valid Government-issued ID.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          fullName: formData.fullName,
          barangay: formData.barangay,
          sitioPurok: formData.sitioPurok,
          yearsOfResidency: formData.yearsOfResidency
        }
      });

      const payload = {
        documentType: "Barangay Clearance",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "barangay-clerks@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: serializedPurpose,
        attachments: [idFile].filter(Boolean) as string[]
      };

      const response = await axios.post("/api/forms/certificate", payload);
      
      if (response.data) {
        // Trigger Barangay staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.fullName} submitted a new Barangay Clearance application for Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "barangay_admin",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create barangay notification", notifErr);
        }

        onSuccess(response.data);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.error("[BarangayClearanceForm] Submit failed, using fallback", error);
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Barangay Clearance",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "barangay-clerks@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            fullName: formData.fullName,
            barangay: formData.barangay,
            sitioPurok: formData.sitioPurok,
            yearsOfResidency: formData.yearsOfResidency
          }
        }),
        attachments: [idFile].filter(Boolean) as string[],
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
          type: "Barangay Clearance",
          description: `Barangay Clearance application submitted for Sitio ${formData.sitioPurok} in Barangay ${formData.barangay}.`,
          submittedAt: fallbackRequest.submittedAt,
          assignedDeptId: "barangay_admin",
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
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
          <FileCheck size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-brand-text uppercase font-display tracking-tight">Barangay Clearance Application</h2>
          <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to Concerned Barangay Office</p>
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
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Full Legal Name *</label>
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
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Sitio / Purok *</label>
            <input
              type="text"
              name="sitioPurok"
              placeholder="e.g. Sitio San Roque, Purok 3"
              value={formData.sitioPurok}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Years of Residency in Talibon *</label>
            <input
              type="number"
              name="yearsOfResidency"
              placeholder="e.g. 15"
              value={formData.yearsOfResidency}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Purpose of Clearance *</label>
          <input
            type="text"
            name="purpose"
            placeholder="e.g. Local Employment, Bank Requirement, School Enrollment"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Required Verification Attachments</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Valid Government-issued ID *</label>
            <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer max-w-md">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!idFile}
              />
              <File size={32} className="text-brand-primary/40 mb-2" />
              <p className="text-xs font-bold text-brand-text">
                {idFile ? "Government ID Uploaded Successfully" : "Upload Government ID card Scan"}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">PNG, JPG, PDF up to 5MB</p>
              {idFile && (
                <span className="mt-3 px-3 py-1 bg-white rounded-lg border border-brand-border text-[9px] font-black uppercase tracking-wider text-brand-primary">
                  {idFile}
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
            <>Submit Barangay Clearance Application <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
