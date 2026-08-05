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

// Local Storage key for fallback requests when Supabase is unreachable or in mock mode
const LOCAL_REQUESTS_KEY = "talibon_local_certificate_requests";

export function getLocalRequests(): CertificateRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRequest(req: CertificateRequest): void {
  try {
    const existing = getLocalRequests();
    const filtered = existing.filter(r => r.ticketId !== req.ticketId);
    filtered.unshift(req);
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("[CertificateService] Failed to save local request fallback:", e);
  }
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
      console.warn("[CertificateService] submit_certificate_request RPC failed, falling back to local storage:", e.message || e);
    }

    // Fallback: Generate local request saved in localStorage
    const ticketId = generateTicketId(payload.documentType);
    const now = new Date().toISOString();
    const newReq: CertificateRequest = {
      id: "local-" + Math.random().toString(36).substring(2, 9),
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay || "Poblacion",
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber || "",
      purpose: payload.purpose || "",
      attachments: payload.attachments || [],
      submittedAt: now,
      status: "Submitted",
      history: [
        {
          id: "hist-1",
          status: "Submitted",
          remarks: "Application received and registered in municipal e-services queue.",
          createdAt: now
        }
      ]
    };

    saveLocalRequest(newReq);
    return newReq;
  },

  /**
   * Get request details by ticket ID or request UUID (tracking)
   */
  async getRequestStatus(ticketId: string): Promise<CertificateRequest | null> {
    const trimmedId = ticketId.trim();
    try {
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
      console.warn(`[CertificateService] RPC track ticket ${ticketId} unavailable, checking local storage:`, e.message || e);
    }

    // Check local storage fallback requests
    const localMatches = getLocalRequests();
    const found = localMatches.find(
      r => r.ticketId?.toLowerCase() === trimmedId.toLowerCase() || r.id === trimmedId
    );
    if (found) {
      return found;
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

        const remote = data.map((requestData: any) => {
          const itemHistory = historyData 
            ? historyData.filter((h: any) => h.request_id === requestData.id)
            : [];
          return mapDbToRequest(requestData, itemHistory);
        });

        // Merge with local requests that aren't in remote
        const local = getLocalRequests();
        const remoteTicketIds = new Set(remote.map(r => r.ticketId));
        const extraLocal = local.filter(l => !remoteTicketIds.has(l.ticketId));

        return [...remote, ...extraLocal];
      }
    } catch (e: any) {
      console.warn("[CertificateService] Database query unavailable, returning local requests:", e.message || e);
    }
    return getLocalRequests();
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
        const { error } = await supabase.rpc("update_request_status", {
          p_request_id: requestId,
          p_status: dbStatus,
          p_remarks: remarks || `Status updated to ${status}`
        });
        updateError = error;
      } else {
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

      if (notifyEmail || notifySms) {
        (async () => {
          let ticketId = "";
          let recipientEmail = "";
          let recipientName = "";
          let documentType = "";
          let recipientMobile = "";

          try {
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

            if (notifyEmail && edgeData?.success) {
              await logEmailAttempt(userEmail, "EMAIL_SENT", requestId, ticketId, recipientEmail, dbStatus);
            } else if (notifyEmail) {
              await logEmailAttempt(userEmail, "EMAIL_FAILED", requestId, ticketId, recipientEmail, dbStatus, edgeData?.error || "Unknown edge error");
            }
          } catch (err: any) {
            console.warn("[CertificateService] Async notification dispatcher failed:", err.message || err);
          }
        })();
      }

      return true;
    } catch (e: any) {
      console.warn("[CertificateService] updateRequestStatus remote update failed, updating local fallback:", e.message || e);
      // Fallback: update in local storage if present
      const localReqs = getLocalRequests();
      const localMatch = localReqs.find(r => r.id === requestId || r.ticketId === requestId);
      if (localMatch) {
        localMatch.status = status;
        localMatch.history = localMatch.history || [];
        localMatch.history.unshift({
          id: "hist-" + Date.now(),
          status: status,
          remarks: remarks || `Status updated to ${status}`,
          createdAt: new Date().toISOString()
        });
        saveLocalRequest(localMatch);
        return true;
      }
    }
    return false;
  }
};
