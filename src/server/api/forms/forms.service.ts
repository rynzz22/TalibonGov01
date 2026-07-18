import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { SupabaseService } from "../../supabase.service";

export interface CertificateRequestPayload {
  id?: string;
  ticketId?: string;
  documentType: string;
  barangay: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  purpose: string;
  attachments?: string[];
  submittedAt?: string;
  status?: string;
}

@Injectable()
export class FormsService {
  private requests: CertificateRequestPayload[] = [];

  constructor(@Inject(SupabaseService) private readonly supabaseService: SupabaseService) {
    // Try fetching from Supabase if connected
    this.loadFromSupabase();
  }

  private async loadFromSupabase() {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client
          .from("certificate_requests")
          .select("*");
        if (!error && data && data.length > 0) {
          this.requests = data.map(item => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
          console.log(`[FormsService] Successfully loaded ${this.requests.length} requests from Supabase.`);
        }
      }
    } catch (err) {
      console.log("[FormsService] Supabase not connected or table 'certificate_requests' does not exist yet. Using local in-memory storage.");
    }
  }

  async getAllRequests(): Promise<CertificateRequestPayload[]> {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client
          .from("certificate_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to fetch all requests from Supabase, returning memory cached:", err);
    }
    return this.requests;
  }

  async updateRequestStatus(requestId: string, status: string, remarks: string): Promise<boolean> {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        // First try to call update_request_status RPC
        const { data, error } = await client.rpc("update_request_status", {
          p_request_id: requestId,
          p_status: status,
          p_remarks: remarks || "Status updated via Admin Dashboard."
        });

        if (error) {
          console.warn("[FormsService] RPC update_request_status failed, falling back to direct table update", error);
          // Fallback to direct update
          const { error: updateError } = await client
            .from("certificate_requests")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", requestId);

          if (updateError) throw updateError;

          // Manually log workflow history if direct update
          await client.from("workflow_history").insert({
            request_id: requestId,
            status: status,
            remarks: remarks || "Status updated via direct database update."
          });
        }
        
        // Update local memory list
        const found = this.requests.find(r => r.id === requestId);
        if (found) {
          found.status = status;
        }

        return true;
      }
    } catch (err) {
      console.error("[FormsService] Failed to update request status in Supabase:", err);
    }

    // In-memory fallback
    const found = this.requests.find(r => r.id === requestId);
    if (found) {
      found.status = status;
      return true;
    }
    return false;
  }

  async submitRequest(payload: CertificateRequestPayload): Promise<CertificateRequestPayload> {
    // Validation
    if (!payload.documentType || !payload.barangay || !payload.fullName || !payload.email || !payload.mobileNumber || !payload.purpose) {
      throw new BadRequestException("All required fields must be provided.");
    }

    let ticketId = `TLB-2026-${String(this.requests.length + 1).padStart(4, "0")}`;
    let dbStatus = "Submitted";
    let submittedAt = new Date().toISOString();
    let requestId = "mock-" + Math.random().toString(36).substring(2, 9);

    const barangayId = payload.barangay.toLowerCase().replace(/\s+/g, "_");

    // Store in Supabase if database is available
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client.rpc("submit_certificate_request", {
          p_document_type: payload.documentType,
          p_barangay_id: barangayId,
          p_full_name: payload.fullName,
          p_email: payload.email,
          p_mobile_number: payload.mobileNumber,
          p_purpose: payload.purpose,
          p_attachments: payload.attachments || []
        });

        if (error) {
          throw error;
        }

        if (data) {
          const requestData = data as any;
          ticketId = requestData.ticket_id || ticketId;
          dbStatus = requestData.status || dbStatus;
          submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
          requestId = requestData.id || requestId;
        }
      }
    } catch (err: any) {
      console.log("[FormsService] Supabase RPC submit failed, running robust fallback", err.message || err);
      // Fallback to direct insertion or in-memory
      try {
        const client = this.supabaseService.getClient();
        if (client) {
          const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
          const { data, error } = await client.from("certificate_requests").insert({
            ticket_id: generatedId,
            document_type: payload.documentType,
            barangay_id: barangayId,
            full_name: payload.fullName,
            email: payload.email,
            mobile_number: payload.mobileNumber,
            purpose: payload.purpose,
            attachments: payload.attachments || [],
            status: "Submitted"
          }).select().maybeSingle();

          if (error) throw error;
          if (data) {
            const requestData = data as any;
            ticketId = requestData.ticket_id || generatedId;
            dbStatus = requestData.status || dbStatus;
            submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
            requestId = requestData.id || requestId;
          }
        }
      } catch (directErr: any) {
        console.log("[FormsService] Fallback direct insert also failed:", directErr.message || directErr);
      }
    }

    const newRequest: CertificateRequestPayload = {
      id: requestId,
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay,
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      purpose: payload.purpose,
      attachments: payload.attachments || [],
      submittedAt,
      status: dbStatus
    };

    // Store in memory
    this.requests.unshift(newRequest);
    return newRequest;
  }

  async getRequestStatus(ticketId: string): Promise<CertificateRequestPayload | null> {
    // If Supabase is connected, try to fetch fresh from Supabase first
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        // Try looking up by ticket_id first, then fallback to id (UUID)
        let query = client.from("certificate_requests").select("*");
        
        // Simple check: if it looks like a UUID, search by id, otherwise ticket_id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId.trim());
        if (isUuid) {
          query = query.eq("id", ticketId.trim());
        } else {
          query = query.eq("ticket_id", ticketId.trim());
        }

        const { data, error } = await query.maybeSingle();
        
        if (!error && data) {
          return {
            id: data.id,
            ticketId: data.ticket_id || data.ticketId,
            documentType: data.document_type || data.documentType,
            barangay: data.barangay_id || data.barangay || "Poblacion",
            fullName: data.full_name || data.fullName,
            email: data.email,
            mobileNumber: data.mobile_number || data.mobileNumber,
            purpose: data.purpose,
            attachments: data.attachments || [],
            submittedAt: data.submitted_at || data.submittedAt,
            status: data.status || "Submitted"
          };
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to lookup request status from Supabase:", err);
    }

    const found = this.requests.find(
      r => r.ticketId?.trim().toUpperCase() === ticketId.trim().toUpperCase() || 
           r.id?.trim() === ticketId.trim()
    );
    return found || null;
  }

  getBusinessPermits() {
    return [
      { id: 1, title: "Business Permit Application Form", url: "#" },
      { id: 2, title: "Business Permit Renewal Form", url: "#" },
    ];
  }

  getBuildingPermits() {
    return [
      { id: 1, title: "Building Permit Application Form", url: "#" },
      { id: 2, title: "Electrical Permit Form", url: "#" },
      { id: 3, title: "Plumbing Permit Form", url: "#" },
    ];
  }

  getZoningClearance() {
    return [
      { id: 1, title: "Zoning Clearance Application Form", url: "#" },
    ];
  }

  getDownloadable() {
    return [
      ...this.getBusinessPermits(),
      ...this.getBuildingPermits(),
      ...this.getZoningClearance(),
    ];
  }
}

