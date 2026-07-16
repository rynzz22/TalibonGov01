import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction } from "./cmsService";

export interface CertificateRequest {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
}

const INITIAL_REQUESTS: CertificateRequest[] = [
  {
    id: "req-1",
    ticketId: "TAL-20260715-0001",
    documentType: "Barangay Clearance",
    barangay: "Poblacion",
    fullName: "Juan Dela Cruz",
    email: "juan@email.com",
    mobileNumber: "09123456789",
    purpose: "Local Employment",
    attachments: ["attached_id.png"],
    submittedAt: new Date().toISOString(),
    status: "Submitted"
  }
];

function getStorageRequests(): CertificateRequest[] {
  const data = localStorage.getItem("cms_data:certificate_requests");
  if (!data) {
    localStorage.setItem("cms_data:certificate_requests", JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  }
  return JSON.parse(data);
}

function setStorageRequests(data: CertificateRequest[]): void {
  localStorage.setItem("cms_data:certificate_requests", JSON.stringify(data));
}

export const certificateService = {
  /**
   * Submit a certificate request using the secure RPC
   */
  async submitRequest(payload: Omit<CertificateRequest, "ticketId" | "submittedAt" | "status">): Promise<CertificateRequest> {
    if (isSupabaseConfigured) {
      try {
        // Map the front-end barangay name to a barangay_id if it's a UUID/ID, otherwise use as-is
        // We'll normalize to a matching ID or default to 'poblacion' in our DB schema if needed
        let barangayId = payload.barangay.toLowerCase().replace(/\s+/g, "_");
        
        // Call secure Supabase RPC
        const { data, error } = await supabase.rpc("submit_certificate_request", {
          p_document_type: payload.documentType,
          p_barangay_id: barangayId,
          p_full_name: payload.fullName,
          p_email: payload.email,
          p_mobile_number: payload.mobileNumber,
          p_purpose: payload.purpose,
          p_attachments: payload.attachments || []
        });

        if (error) throw error;
        
        if (data) {
          const requestData = data as any;
          return {
            id: requestData.id,
            ticketId: requestData.ticket_id,
            documentType: requestData.document_type,
            barangay: requestData.barangay_id,
            fullName: requestData.full_name,
            email: requestData.email,
            mobileNumber: requestData.mobile_number,
            purpose: requestData.purpose,
            attachments: requestData.attachments || [],
            submittedAt: requestData.submitted_at || requestData.created_at,
            status: requestData.status
          };
        }
      } catch (e: any) {
        console.error("[CertificateService] submit_certificate_request RPC failed, falling back to direct insert:", e.message || e);
        // Fallback to direct table insertion if RPC is not available or fails
        try {
          const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
          const { data, error } = await supabase
            .from("certificate_requests")
            .insert([{
              ticket_id: generatedId,
              document_type: payload.documentType,
              barangay_id: payload.barangay.toLowerCase().replace(/\s+/g, "_"),
              full_name: payload.fullName,
              email: payload.email,
              mobile_number: payload.mobileNumber,
              purpose: payload.purpose,
              attachments: payload.attachments || [],
              status: "Submitted"
            }])
            .select()
            .maybeSingle();

          if (error) throw error;
          if (data) {
            const requestData = data as any;
            return {
              id: requestData.id,
              ticketId: requestData.ticket_id,
              documentType: requestData.document_type,
              barangay: requestData.barangay_id || payload.barangay,
              fullName: requestData.full_name,
              email: requestData.email,
              mobileNumber: requestData.mobile_number,
              purpose: requestData.purpose,
              attachments: requestData.attachments || [],
              submittedAt: requestData.submitted_at,
              status: requestData.status
            };
          }
        } catch (tableErr: any) {
          console.error("[CertificateService] Direct insert fallback also failed:", tableErr.message || tableErr);
        }
      }
    }

    // Local Storage Mock fallback
    const ticketId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
    const newRequest: CertificateRequest = {
      id: "mock-" + Math.random().toString(36).substring(2, 9),
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay,
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      purpose: payload.purpose,
      attachments: payload.attachments || [],
      submittedAt: new Date().toISOString(),
      status: "Submitted"
    };

    const list = getStorageRequests();
    list.unshift(newRequest);
    setStorageRequests(list);
    return newRequest;
  },

  /**
   * Get request details by ticket ID (tracking)
   */
  async getRequestStatus(ticketId: string): Promise<CertificateRequest | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("certificate_requests")
          .select("*")
          .eq("ticket_id", ticketId.trim())
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const requestData = data as any;
          return {
            id: requestData.id,
            ticketId: requestData.ticket_id,
            documentType: requestData.document_type,
            barangay: requestData.barangay_id || "Poblacion",
            fullName: requestData.full_name,
            email: requestData.email,
            mobileNumber: requestData.mobile_number,
            purpose: requestData.purpose,
            attachments: requestData.attachments || [],
            submittedAt: requestData.submitted_at || requestData.created_at,
            status: requestData.status
          };
        }
      } catch (e: any) {
        console.error(`[CertificateService] Failed to track ticket ${ticketId}:`, e.message || e);
      }
    }

    const list = getStorageRequests();
    return list.find(r => r.ticketId.trim().toUpperCase() === ticketId.trim().toUpperCase()) || null;
  },

  /**
   * Fetch all requests (for Admin views)
   */
  async getAllRequests(): Promise<CertificateRequest[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("certificate_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) throw error;
        if (data) {
          return data.map((requestData: any) => ({
            id: requestData.id,
            ticketId: requestData.ticket_id,
            documentType: requestData.document_type,
            barangay: requestData.barangay_id || "Poblacion",
            fullName: requestData.full_name,
            email: requestData.email,
            mobileNumber: requestData.mobile_number,
            purpose: requestData.purpose,
            attachments: requestData.attachments || [],
            submittedAt: requestData.submitted_at || requestData.created_at,
            status: requestData.status
          }));
        }
      } catch (e: any) {
        console.error("[CertificateService] Failed to fetch all requests:", e.message || e);
      }
    }
    return getStorageRequests();
  },

  /**
   * Transition request status using the secure RPC
   */
  async updateRequestStatus(requestId: string, status: string, remarks: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc("update_request_status", {
          p_request_id: requestId,
          p_status: status,
          p_remarks: remarks
        });

        if (error) throw error;
        await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
        return true;
      } catch (e: any) {
        console.warn("[CertificateService] update_request_status RPC failed, falling back to direct table update:", e.message || e);
        try {
          const { error } = await supabase
            .from("certificate_requests")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", requestId);
          
          if (error) throw error;
          await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
          return true;
        } catch (tableErr: any) {
          console.error("[CertificateService] Direct update status fallback failed:", tableErr.message || tableErr);
          throw tableErr;
        }
      }
    }

    // Local Storage Fallback
    const list = getStorageRequests();
    const index = list.findIndex(r => r.id === requestId);
    if (index !== -1) {
      list[index].status = status;
      setStorageRequests(list);
      await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
      return true;
    }
    return false;
  }
};
