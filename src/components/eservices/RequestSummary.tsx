import React from "react";
import { Shield, FileText, Calendar, Landmark, MapPin, DollarSign, Briefcase, Users, FileCheck } from "lucide-react";

interface RequestSummaryProps {
  documentType: string;
  purposeJson: string;
  ticketId: string;
  submittedAt?: string;
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  documentType,
  purposeJson,
  ticketId,
  submittedAt
}) => {
  // Safe parsing helper
  const parseData = (): { purposeText?: string; form_data?: Record<string, any> } => {
    if (!purposeJson || typeof purposeJson !== "string") {
      return { purposeText: purposeJson || "Not provided" };
    }
    const trimmed = purposeJson.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return { purposeText: trimmed };
    }
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      console.warn("[RequestSummary] Failed to parse JSON purpose data:", e);
      return { purposeText: trimmed };
    }
  };

  const parsed = parseData();
  const purposeText = parsed.purposeText || "Not provided";
  const formData = parsed.form_data || {};

  // Utility to convert keys (camelCase or snake_case) to Title Case human labels
  const formatLabel = (key: string): string => {
    // Add spaces before capitals, replace underscores with spaces
    let label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim();
    // Capitalize first letter of each word
    return label
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Utility to format barangay name
  const formatBarangay = (val: any): string => {
    if (!val) return "Not provided";
    const str = String(val).trim();
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Safe value retriever with fallback
  const getVal = (key: string): string => {
    const val = formData[key] !== undefined ? formData[key] : "Not provided";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (key.toLowerCase().includes("barangay")) return formatBarangay(val);
    return String(val);
  };

  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Not provided";

  // Build key-value groups depending on documentType
  const renderDocumentFields = () => {
    const docTypeLower = documentType.toLowerCase();

    if (docTypeLower.includes("clearance") && docTypeLower.includes("barangay")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-amber-50/20 border border-amber-100/50 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-amber-600/80 tracking-widest block mb-1">
              Purpose
            </span>
            <span className="text-xs font-bold text-gray-900">{purposeText}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Barangay
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("barangay")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Sitio / Purok
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("sitioPurok")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Years of Residency
            </span>
            <span className="text-xs font-black text-blue-600">{getVal("yearsOfResidency")}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("business")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 p-4 bg-blue-50/20 border border-blue-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-blue-600 tracking-widest block mb-1">
              Business Name
            </span>
            <span className="text-sm font-black text-gray-900">{getVal("businessName")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Owner / Applicant
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("ownerName")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Nature of Business
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("natureOfBusiness")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Business Address
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("businessAddress")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Barangay
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("barangay")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              DTI / SEC Registration No
            </span>
            <span className="text-xs font-mono font-bold text-teal-600">{getVal("dtiSecRegNo")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Contact / Phone
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("contactNumber")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl col-span-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Purpose
            </span>
            <span className="text-xs text-gray-700">{purposeText}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("building")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-teal-50/20 border border-teal-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-teal-600 tracking-widest block mb-1">
              Project / Construction Type
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("constructionType")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Property Owner
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("propertyOwner")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Location / Address
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("propertyAddress")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Barangay
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("barangay")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Lot Number
            </span>
            <span className="text-xs font-mono font-bold text-gray-900">{getVal("lotNumber")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Tax Declaration No
            </span>
            <span className="text-xs font-mono font-bold text-gray-900">{getVal("taxDeclarationNo")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Estimated Cost
            </span>
            <span className="text-xs font-black text-emerald-600">₱{getVal("estimatedCost")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Total Floor Area
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("floorArea")} sqm</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl col-span-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Responsible Engineer / Architect
            </span>
            <span className="text-xs font-black text-gray-800">{getVal("engineerArchitect")}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("cedula") || docTypeLower.includes("ctc") || docTypeLower.includes("community tax")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-indigo-600 tracking-widest block mb-1">
              Taxpayer Legal Name
            </span>
            <span className="text-sm font-black text-gray-900">
              {getVal("firstName")} {formData.middleName ? formData.middleName + " " : ""}{getVal("lastName")}
            </span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Date & Place of Birth
            </span>
            <span className="text-xs font-bold text-gray-900">
              {getVal("dateOfBirth")} | {getVal("placeOfBirth")}
            </span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Civil Status & Gender
            </span>
            <span className="text-xs font-bold text-gray-900">
              {getVal("civilStatus")} | {getVal("gender")}
            </span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Profession / Occupation
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("profession")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Citizenship
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("citizenship")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl col-span-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Address
            </span>
            <span className="text-xs text-gray-700">
              {getVal("purokSitio")}, {getVal("barangay")}, {getVal("municipality")}, {getVal("province")} {getVal("zipCode")}
            </span>
          </div>
          
          {/* CTC Taxes box */}
          <div className="col-span-1 sm:col-span-2 p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-700 tracking-widest block">Basic Tax</span>
              <span className="text-xs font-black text-gray-900">₱{parseFloat(getVal("basicTax") || "0").toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-emerald-700 tracking-widest block">Additional Tax</span>
              <span className="text-xs font-black text-gray-900">₱{parseFloat(getVal("additionalTax") || "0").toFixed(2)}</span>
            </div>
            <div className="border-l border-emerald-100 pl-4">
              <span className="text-[9px] uppercase font-black text-emerald-800 tracking-widest block">Total Assessment</span>
              <span className="text-sm font-black text-emerald-700">₱{parseFloat(getVal("totalTax") || "0").toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("indigency")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 bg-purple-50/20 border border-purple-100/50 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-purple-600 tracking-widest block mb-1">
              Purpose / Reason
            </span>
            <span className="text-sm font-bold text-gray-900">{purposeText}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Applicant Full Name
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("fullName")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Residence Barangay
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("barangay")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Household / Family Members
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("familyMembers")} members</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Reported Monthly Income
            </span>
            <span className="text-xs font-black text-purple-600">₱{getVal("monthlyIncome")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2 p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Detailed Case Explanation / Reason
            </span>
            <span className="text-xs text-gray-700 block whitespace-pre-line">{getVal("reason")}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("zoning")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-rose-50/20 border border-rose-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-rose-600 tracking-widest block mb-1">
              Applicant Name
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("applicantName")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Barangay
            </span>
            <span className="text-xs font-black text-gray-900">{getVal("barangay")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl col-span-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Property Location / Address
            </span>
            <span className="text-xs font-bold text-gray-900">{getVal("propertyAddress")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Lot Number
            </span>
            <span className="text-xs font-mono font-bold text-gray-900">{getVal("lotNumber")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Tax Declaration No
            </span>
            <span className="text-xs font-mono font-bold text-gray-900">{getVal("taxDeclarationNo")}</span>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl col-span-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Clearance Purpose
            </span>
            <span className="text-xs text-gray-700">{purposeText}</span>
          </div>
        </div>
      );
    }

    // Generic Fallback when properties are nested directly or if no specific type is detected
    const keys = Object.keys(formData);
    if (keys.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
              Core Purpose / Statement
            </span>
            <span className="text-xs text-gray-900 font-bold">{purposeText}</span>
          </div>
          {keys.map(key => {
            if (key === "purposeText" || key === "form_data") return null;
            return (
              <div key={key} className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
                  {formatLabel(key)}
                </span>
                <span className="text-xs font-bold text-gray-900 truncate block">
                  {getVal(key)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Absolutely no nested properties
    return (
      <div className="p-5 bg-amber-50/20 border border-amber-100 rounded-2xl">
        <span className="text-[10px] uppercase font-black text-amber-600 tracking-widest block mb-1">
          Detailed Purpose / Notes
        </span>
        <p className="text-xs font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
          {purposeText}
        </p>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden bg-radial from-slate-50 to-white border-2 border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-xl max-w-2xl mx-auto font-sans text-left">
      {/* Government Document Watermark Accent */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-slate-100/50 rounded-full border-[1.5rem] border-slate-200/30 flex items-center justify-center pointer-events-none select-none">
        <Landmark className="text-slate-300/30 w-32 h-32" />
      </div>

      {/* Official Top Banner */}
      <div className="flex flex-col items-center text-center pb-6 border-b-2 border-dashed border-slate-200 mb-6 space-y-2">
        <div className="inline-flex items-center justify-center bg-slate-900 text-white p-3 rounded-2xl shadow-md">
          <Landmark size={24} />
        </div>
        <div>
          <h2 className="text-xs font-black tracking-widest text-slate-800 uppercase leading-none">
            Republic of the Philippines
          </h2>
          <h3 className="text-base font-black tracking-tight text-slate-900 leading-tight">
            MUNICIPALITY OF TALIBON, BOHOL
          </h3>
          <p className="text-[9px] font-mono uppercase font-bold text-blue-600/80 tracking-widest mt-0.5">
            Official Municipal E-Services Portal
          </p>
        </div>
      </div>

      {/* Tracking and Header Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
            Service Certificate Type
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-xl">
            <FileText size={12} className="text-blue-600" />
            <span className="text-xs font-black text-blue-700 uppercase">
              {documentType}
            </span>
          </div>
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
            Transaction Track ID
          </span>
          <span className="inline-block font-mono text-xs font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
            {ticketId}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
            Security Integration
          </span>
          <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold">
            <Shield size={10} />
            <span>SECURED DATABASE PIPELINE</span>
          </div>
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
            Authorized Submission Date
          </span>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 font-bold sm:justify-end">
            <Calendar size={11} className="text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Document Dynamic Fields Grid */}
      <div className="relative z-10 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400/90 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <FileCheck size={12} className="text-blue-500" />
          Submitted Form Data
        </h4>
        {renderDocumentFields()}
      </div>

      {/* Official Footnote / Authenticity Disclaimer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-200/60 flex flex-col sm:flex-row justify-between items-center text-[8px] text-slate-400/80 font-mono font-bold uppercase tracking-widest gap-2">
        <span>TALIBON LGU TRANSACTION CERTIFICATE</span>
        <span>VERIFIED THROUGH SECURED CLOUD DATABASE</span>
      </div>
    </div>
  );
};
