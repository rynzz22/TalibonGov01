import { supabase } from "../lib/supabase";
import { logCmsAction } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

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
  history?: {
    id?: string;
    status: string;
    remarks: string | null;
    createdAt: string;
  }[];
}

// Generate unique Ticket ID matching custom format per document type
function generateTicketId(documentType: string): string {
  const prefix = documentType.toLowerCase().includes("cedula") 
    ? "CTC" 
    : documentType.toLowerCase().includes("business")
    ? "BPLO"
    : documentType.toLowerCase().includes("building")
    ? "ENG"
    : documentType.toLowerCase().includes("zoning")
    ? "MPDO"
    : documentType.toLowerCase().includes("barangay")
    ? "BRGY"
    : "TLB";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `${prefix}-${year}-${random}`;
}

// Map the DB snake_case columns back to the frontend CertificateRequest interface
function mapDbToRequest(row: any, history: any[] = []): CertificateRequest {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    documentType: row.document_type,
    barangay: row.barangay_id || "Poblacion",
    fullName: row.full_name,
    email: row.email,
    mobileNumber: row.mobile_number || "",
    purpose: row.purpose || "",
    attachments: row.attachments || [],
    submittedAt: row.submitted_at || row.created_at,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    history: history.map((h: any) => ({
      id: h.id,
      status: h.status,
      remarks: h.remarks,
      createdAt: h.created_at
    }))
  };
}

// Map frontend status string to official PostgreSQL Enum type status values
function mapStatusToDb(status: string): string {
  const upper = status.trim().toUpperCase();
  if (upper === "SUBMITTED" || upper === "PENDING") return "Submitted";
  if (upper === "ASSIGNED") return "Assigned";
  if (upper === "PROCESSING" || upper === "PREPARING" || upper === "IN_PROGRESS") return "Processing";
  if (upper === "RETURNED") return "Returned";
  if (upper === "APPROVED" || upper === "READY") return "Approved";
  if (upper === "REJECTED") return "Rejected";
  if (upper === "CLAIMED" || upper === "COMPLETED") return "Completed";
  return "Submitted";
}

export const certificateService = {
  /**
   * Submit a certificate request directly to Supabase certificate_requests table
   */
  async submitRequest(payload: Omit<CertificateRequest, "ticketId" | "submittedAt" | "status">): Promise<CertificateRequest> {
    try {
      const ticketId = generateTicketId(payload.documentType);
      const insertData = {
        ticket_id: ticketId,
        document_type: payload.documentType,
        barangay_id: payload.barangay || null,
        full_name: payload.fullName,
        email: payload.email,
        mobile_number: payload.mobileNumber || null,
        purpose: payload.purpose || null,
        attachments: payload.attachments || [],
        status: "Submitted" as any
      };

      const { data, error } = await supabase
        .from("certificate_requests")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Log initial workflow timeline history
        try {
          await supabase.from("workflow_history").insert({
            request_id: data.id,
            status: "Submitted" as any,
            remarks: "Application submitted successfully online."
          });
        } catch (histErr) {
          console.warn("[CertificateService] Failed to insert initial timeline history:", histErr);
        }

        return mapDbToRequest(data);
      }
    } catch (e: any) {
      console.error("[CertificateService] direct submitRequest failed:", e.message || e);
      throw e;
    }

    throw new Error("Failed to submit request.");
  },

  /**
   * Get request details by ticket ID or request UUID (tracking)
   */
  async getRequestStatus(ticketId: string): Promise<CertificateRequest | null> {
    try {
      const trimmedId = ticketId.trim();
      let query = supabase.from("certificate_requests").select("*");
      
      // If it's a UUID, look up by both ticket_id and id. Otherwise, search by ticket_id only.
      if (trimmedId.length === 36) {
        query = query.or(`ticket_id.eq.${trimmedId},id.eq.${trimmedId}`);
      } else {
        query = query.eq("ticket_id", trimmedId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Fetch historical updates
        const { data: historyData } = await supabase
          .from("workflow_history")
          .select("*")
          .eq("request_id", data.id)
          .order("created_at", { ascending: false });

        return mapDbToRequest(data, historyData || []);
      }
    } catch (e: any) {
      if (!isMockAllowed()) {
        throw e;
      }
      console.error(`[CertificateService] Failed to track ticket ${ticketId}:`, e.message || e);
    }
    return null;
  },

  /**
   * Fetch all requests from Supabase certificate_requests table (for Admin view)
   */
  async getAllRequests(): Promise<CertificateRequest[]> {
    try {
      const { data, error } = await supabase
        .from("certificate_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        // Fetch all workflow histories in a single query for optimal UI loading speed
        const { data: historyData } = await supabase
          .from("workflow_history")
          .select("*")
          .order("created_at", { ascending: false });

        return data.map((requestData: any) => {
          const itemHistory = historyData 
            ? historyData.filter((h: any) => h.request_id === requestData.id)
            : [];
          return mapDbToRequest(requestData, itemHistory);
        });
      }
    } catch (e: any) {
      if (!isMockAllowed()) {
        throw e;
      }
      console.error("[CertificateService] Failed to fetch all requests:", e.message || e);
    }
    return [];
  },

  /**
   * Transition request status and log updates directly in Supabase
   */
  async updateRequestStatus(
    requestId: string,
    status: string,
    remarks: string,
    userEmail: string,
    notifyCitizen: boolean = true,
    saveTimeline: boolean = true
  ): Promise<boolean> {
    try {
      const dbStatus = mapStatusToDb(status);
      const { error } = await supabase
        .from("certificate_requests")
        .update({
          status: dbStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        throw error;
      }

      if (saveTimeline) {
        try {
          // Look up user profile to assign as actor
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", userEmail)
            .maybeSingle();

          await supabase.from("workflow_history").insert({
            request_id: requestId,
            status: dbStatus as any,
            remarks: remarks || `Status updated to ${status}`,
            actor_id: profileData?.id || null
          });
        } catch (timelineErr) {
          console.warn("[CertificateService] Failed to insert workflow_history entry:", timelineErr);
        }
      }

      await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
      return true;
    } catch (e: any) {
      if (!isMockAllowed()) {
        throw e;
      }
      console.error("[CertificateService] updateRequestStatus failed:", e.message || e);
    }
    return false;
  }
};
