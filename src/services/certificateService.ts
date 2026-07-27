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

// Helper to log email notification attempts inside audit_logs table
async function logEmailAttempt(
  userEmail: string,
  action: "EMAIL_SENT" | "EMAIL_FAILED",
  requestId: string,
  ticketId: string,
  recipient: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const email = userEmail || "system@talibon.gov.ph";
  const dataPayload = {
    request_id: requestId,
    ticket_id: ticketId,
    recipient: recipient,
    status: status,
    ...(errorMessage ? { error_message: errorMessage } : {})
  };

  try {
    const { error } = await supabase.from("audit_logs").insert([{
      user_email: email,
      action: action as any,
      target_table: "certificate_requests",
      target_id: requestId,
      new_data: dataPayload
    }]);
    if (error) throw error;
  } catch (err: any) {
    console.warn("[CertificateService] Failed to insert email audit log:", err.message || err);
  }
}

export const certificateService = {
  /**
   * Submit a certificate request directly to Supabase via secure RPC
   */
  async submitRequest(payload: Omit<CertificateRequest, "ticketId" | "submittedAt" | "status">): Promise<CertificateRequest> {
    try {
      const { data, error } = await supabase.rpc("submit_certificate_request", {
        p_document_type: payload.documentType,
        p_barangay_id: payload.barangay || "Poblacion",
        p_full_name: payload.fullName,
        p_email: payload.email || null,
        p_mobile_number: payload.mobileNumber || null,
        p_purpose: payload.purpose || null,
        p_attachments: payload.attachments || []
      });

      if (error) {
        throw error;
      }

      if (data) {
        return mapDbToRequest(data);
      }
    } catch (e: any) {
      console.error("[CertificateService] submit_certificate_request RPC failed:", e.message || e);
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
      
      const { data, error } = await supabase.rpc("get_request_status_by_ticket", {
        p_ticket_id: trimmedId
      });

      if (error) {
        throw error;
      }

      if (data) {
        return mapDbToRequest(data, data.history || []);
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
    notifyEmail: boolean = true,
    notifySms: boolean = false,
    saveTimeline: boolean = true
  ): Promise<boolean> {
    try {
      const dbStatus = mapStatusToDb(status);
      let updateError: any = null;

      if (saveTimeline) {
        // Use the postgres transition RPC which atomically updates status and applies custom remarks
        // on the exact single timeline row generated by the trigger, preventing any duplicates!
        const { error } = await supabase.rpc("update_request_status", {
          p_request_id: requestId,
          p_status: dbStatus,
          p_remarks: remarks || `Status updated to ${status}`
        });
        updateError = error;
      } else {
        // If not saving timeline, perform a direct status update
        const { error } = await supabase
          .from("certificate_requests")
          .update({
            status: dbStatus as any,
            updated_at: new Date().toISOString()
          })
          .eq("id", requestId);
        updateError = error;
      }

      if (updateError) {
        throw updateError;
      }

      await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);

      // Handle alerts in background asynchronously, without blocking status transitions
      if (notifyEmail || notifySms) {
        (async () => {
          let ticketId = "";
          let recipientEmail = "";
          let recipientName = "";
          let documentType = "";
          let recipientMobile = "";

          try {
            // Retrieve latest details of the request
            const { data: requestDetails, error: fetchErr } = await supabase
              .from("certificate_requests")
              .select("ticket_id, document_type, full_name, email, mobile_number")
              .eq("id", requestId)
              .maybeSingle();

            if (fetchErr) throw fetchErr;
            if (!requestDetails) throw new Error("Request details not found in database");

            ticketId = requestDetails.ticket_id || "";
            recipientEmail = requestDetails.email || "";
            recipientName = requestDetails.full_name || "";
            documentType = requestDetails.document_type || "";
            recipientMobile = requestDetails.mobile_number || "";

            // Call send-status-email Edge Function to handle both dispatching and trusted logging
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke("send-status-email", {
              body: {
                requestId,
                ticketId,
                status: dbStatus,
                remarks: remarks || "",
                recipientEmail,
                recipientName,
                documentType,
                recipientMobile,
                notifyEmail,
                notifySms
              }
            });

            if (edgeError) throw edgeError;

            // Log administrative audit action
            if (notifyEmail && edgeData?.success) {
              await logEmailAttempt(userEmail, "EMAIL_SENT", requestId, ticketId, recipientEmail, dbStatus);
            } else if (notifyEmail) {
              await logEmailAttempt(userEmail, "EMAIL_FAILED", requestId, ticketId, recipientEmail, dbStatus, edgeData?.error || "Unknown edge error");
            }
          } catch (err: any) {
            console.error("[CertificateService] Async notification dispatcher failed:", err.message || err);
            try {
              if (notifyEmail) {
                await logEmailAttempt(userEmail, "EMAIL_FAILED", requestId, ticketId, recipientEmail, dbStatus, err.message || String(err));
              }
            } catch (logErr) {
              // Silence audit log failures
            }
          }
        })();
      }

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
