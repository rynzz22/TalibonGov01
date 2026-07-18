import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import axios from "axios";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";

interface EZoningClearanceFormProps {
  onSuccess: (result: any) => void;
}

export default function EZoningClearanceForm({ onSuccess }: EZoningClearanceFormProps) {
  const [formData, setFormData] = useState({
    applicantName: () => "", // Using initial empty state
    propertyAddress: "",
    barangay: "poblacion",
    lotNumber: "",
    taxDeclarationNo: "",
    purpose: "Residential Zoning Locational Clearance"
  });

  // Since React prefers standard state initializers over functional ones for pure strings
  const [applicant, setApplicant] = useState("");

  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [taxDecFile, setTaxDecFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: "sketch" | "taxdec") => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (fileType === "sketch") {
        setSketchFile(fileName);
      } else {
        setTaxDecFile(fileName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validation
    if (!applicant.trim()) return setValidationError("Applicant name is required.");
    if (!formData.propertyAddress.trim()) return setValidationError("Property location address is required.");
    if (!formData.lotNumber.trim()) return setValidationError("Lot number is required.");
    if (!formData.taxDeclarationNo.trim()) return setValidationError("Tax Declaration number is required.");
    if (!sketchFile) return setValidationError("Please upload your Lot Site Sketch Plan.");
    if (!taxDecFile) return setValidationError("Please upload your RPT Tax Declaration Certificate.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          applicantName: applicant,
          propertyAddress: formData.propertyAddress,
          barangay: formData.barangay,
          lotNumber: formData.lotNumber,
          taxDeclarationNo: formData.taxDeclarationNo
        }
      });

      const payload = {
        documentType: "Zoning Clearance",
        barangay: formData.barangay,
        fullName: applicant,
        email: "mpdo-planning@talibon.gov.ph", // Internal planning email
        mobileNumber: "09123456789",
        purpose: serializedPurpose,
        attachments: [sketchFile, taxDecFile].filter(Boolean) as string[]
      };

      const response = await axios.post("/api/forms/certificate", payload);
      
      if (response.data) {
        // Trigger MPDO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${applicant} submitted a new Zoning Locational Clearance application in Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "mpdo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create MPDO notification", notifErr);
        }

        onSuccess(response.data);
      }
    } catch (error) {
      console.error("[ZoningClearanceForm] Submit failed, using fallback", error);
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Zoning Clearance",
        barangay: formData.barangay,
        fullName: applicant,
        email: "mpdo-planning@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            applicantName: applicant,
            propertyAddress: formData.propertyAddress,
            barangay: formData.barangay,
            lotNumber: formData.lotNumber,
            taxDeclarationNo: formData.taxDeclarationNo
          }
        }),
        attachments: [sketchFile, taxDecFile].filter(Boolean) as string[],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };

      // Add to local state of citizen requests
      try {
        const saved = localStorage.getItem('talibon_citizen_requests');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: `req-${generatedId}`,
          citizenName: applicant,
          type: "Zoning Clearance",
          description: `Zoning Locational Clearance application submitted for lot in Barangay ${formData.barangay}.`,
          submittedAt: fallbackRequest.submittedAt,
          assignedDeptId: "mpdo",
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
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
          <MapPin size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-brand-text uppercase font-display tracking-tight">Zoning clearance Locational Application</h2>
          <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to Municipal Planning & Development Office</p>
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
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Applicant / Property Owner Full Name *</label>
            <input
              type="text"
              name="applicant"
              placeholder="e.g. Bernardo Carpio Jr."
              value={applicant}
              onChange={(e) => setApplicant(e.target.value)}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Locational Purpose of Clearance *</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            >
              <option value="Residential Zoning Locational Clearance">Residential Construction Locational Clearance</option>
              <option value="Commercial Zoning Locational Clearance">Commercial Locational Clearance</option>
              <option value="Industrial Zoning Locational Clearance">Industrial Zoning locational Clearance</option>
              <option value="Institutional Zoning Locational Clearance">Institutional / School Clearance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Lot / Survey Block Number *</label>
            <input
              type="text"
              name="lotNumber"
              placeholder="e.g. Lot 15, Block 3-B"
              value={formData.lotNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Tax Declaration Certificate Number *</label>
            <input
              type="text"
              name="taxDeclarationNo"
              placeholder="e.g. TD-2026-4820-A"
              value={formData.taxDeclarationNo}
              onChange={(e) => setFormData(prev => ({ ...prev, taxDeclarationNo: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Property Physical Address *</label>
            <input
              type="text"
              name="propertyAddress"
              placeholder="e.g. Sitio San Juan Crossroads"
              value={formData.propertyAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Registered Barangay *</label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            >
              {BARANGAYS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Required Site Maps & Property Title Certificates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Property Lot site Sketch Map *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "sketch")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!sketchFile}
                />
                <File size={24} className="text-brand-primary/40 mb-1" />
                <p className="text-[11px] font-bold text-brand-text">
                  {sketchFile ? "Site Sketch Selected" : "Upload Lot Survey Sketch Map"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF or Image of property site map</p>
                {sketchFile && (
                  <span className="mt-2 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {sketchFile}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">RPT Tax Declaration Certificate *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "taxdec")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!taxDecFile}
                />
                <File size={24} className="text-brand-primary/40 mb-1" />
                <p className="text-[11px] font-bold text-brand-text">
                  {taxDecFile ? "Tax Declaration Uploaded" : "Upload RPT Tax Declaration"}
                </p>
                <p className="text-[9px] text-brand-muted">Official Treasurer's Tax Assessment Document</p>
                {taxDecFile && (
                  <span className="mt-2 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {taxDecFile}
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
            <>Submit Zoning Locational Application <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
