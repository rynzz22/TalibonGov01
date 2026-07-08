import { Injectable, BadRequestException } from "@nestjs/common";
import { SupabaseService } from "../../supabase.service";

export interface CertificateRequestPayload {
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

  constructor(private readonly supabaseService: SupabaseService) {
    // Seed some mock/default requests for tracking demonstration
    this.requests = [
      {
        ticketId: "TLB-2026-0041",
        documentType: "Barangay Clearance",
        barangay: "Poblacion",
        fullName: "Juan Dela Cruz",
        email: "juan@email.com",
        mobileNumber: "09123456789",
        purpose: "Local Employment",
        attachments: ["attached_id.png"],
        submittedAt: "2026-07-07T08:00:00Z",
        status: "Submitted"
      },
      {
        ticketId: "TLB-2026-0042",
        documentType: "Business Permit Clearance",
        barangay: "San Isidro",
        fullName: "Maria Santos",
        email: "maria@email.com",
        mobileNumber: "09987654321",
        purpose: "Business Operations",
        attachments: ["attached_id.png"],
        submittedAt: "2026-07-07T08:15:00Z",
        status: "Under Review"
      },
      {
        ticketId: "TLB-2026-0043",
        documentType: "Certificate of Indigency",
        barangay: "Poblacion",
        fullName: "Pedro Penduko",
        email: "pedro@email.com",
        mobileNumber: "09112223333",
        purpose: "Scholarship",
        attachments: ["attached_id.png"],
        submittedAt: "2026-07-07T08:30:00Z",
        status: "Approved"
      }
    ];

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
          // Map to match payload format if needed, then seed
          this.requests = data.map(item => ({
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay,
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

  async submitRequest(payload: CertificateRequestPayload): Promise<CertificateRequestPayload> {
    // Validation
    if (!payload.documentType || !payload.barangay || !payload.fullName || !payload.email || !payload.mobileNumber || !payload.purpose) {
      throw new BadRequestException("All required fields must be provided.");
    }

    // Generate ticketId (e.g., TLB-2026-0001 or using length to simulate unique index sequence)
    const nextNum = this.requests.length + 1;
    const ticketId = `TLB-2026-${String(nextNum).padStart(4, "0")}`;

    const newRequest: CertificateRequestPayload = {
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay,
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      purpose: payload.purpose,
      attachments: payload.attachments || ["attached_id.png"],
      submittedAt: new Date().toISOString(),
      status: "Submitted"
    };

    // Store in memory
    this.requests.unshift(newRequest);

    // Store in Supabase if database is available
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        await client.from("certificate_requests").insert({
          ticket_id: newRequest.ticketId,
          document_type: newRequest.documentType,
          barangay: newRequest.barangay,
          full_name: newRequest.fullName,
          email: newRequest.email,
          mobile_number: newRequest.mobileNumber,
          purpose: newRequest.purpose,
          attachments: newRequest.attachments,
          submitted_at: newRequest.submittedAt,
          status: newRequest.status
        });
      }
    } catch (err) {
      // Graceful fallback
      console.log("[FormsService] Saved locally to in-memory store. Supabase write bypassed.");
    }

    return newRequest;
  }

  async getRequestStatus(ticketId: string): Promise<CertificateRequestPayload | null> {
    // If Supabase is connected, try to fetch fresh from Supabase first
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client
          .from("certificate_requests")
          .select("*")
          .eq("ticket_id", ticketId)
          .single();
        
        if (!error && data) {
          return {
            ticketId: data.ticket_id || data.ticketId,
            documentType: data.document_type || data.documentType,
            barangay: data.barangay,
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
      // Fallback to local
    }

    const found = this.requests.find(r => r.ticketId?.trim().toUpperCase() === ticketId.trim().toUpperCase());
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

