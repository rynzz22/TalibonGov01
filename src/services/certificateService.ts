import axios from "axios";
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

export const certificateService = {
  /**
   * Submit a certificate request using the secure backend endpoint
   */
  async submitRequest(payload: Omit<CertificateRequest, "ticketId" | "submittedAt" | "status">): Promise<CertificateRequest> {
    try {
      const response = await axios.post("/api/forms/certificate", payload);
      if (response.data) {
        return {
          id: response.data.id,
          ticketId: response.data.ticketId,
          documentType: response.data.documentType,
          barangay: response.data.barangay,
          fullName: response.data.fullName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber,
          purpose: response.data.purpose,
          attachments: response.data.attachments || [],
          submittedAt: response.data.submittedAt,
          status: response.data.status
        };
      }
    } catch (e: any) {
      console.error("[CertificateService] backend submitRequest failed:", e.message || e);
      throw e;
    }

    throw new Error("Failed to submit request.");
  },

  /**
   * Get request details by ticket ID or request ID (tracking)
   */
  async getRequestStatus(ticketId: string): Promise<CertificateRequest | null> {
    try {
      const response = await axios.get(`/api/forms/certificate/${ticketId.trim()}`);
      if (response.data && response.data.success && response.data.request) {
        const requestData = response.data.request;
        return {
          id: requestData.id,
          ticketId: requestData.ticketId,
          documentType: requestData.documentType,
          barangay: requestData.barangay,
          fullName: requestData.fullName,
          email: requestData.email,
          mobileNumber: requestData.mobileNumber,
          purpose: requestData.purpose,
          attachments: requestData.attachments || [],
          submittedAt: requestData.submittedAt,
          status: requestData.status
        };
      }
    } catch (e: any) {
      console.error(`[CertificateService] Failed to track ticket ${ticketId}:`, e.message || e);
    }
    return null;
  },

  /**
   * Fetch all requests (for Admin views)
   */
  async getAllRequests(): Promise<CertificateRequest[]> {
    try {
      const response = await axios.get("/api/forms/certificate");
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((requestData: any) => ({
          id: requestData.id,
          ticketId: requestData.ticketId,
          documentType: requestData.documentType,
          barangay: requestData.barangay,
          fullName: requestData.fullName,
          email: requestData.email,
          mobileNumber: requestData.mobileNumber,
          purpose: requestData.purpose,
          attachments: requestData.attachments || [],
          submittedAt: requestData.submittedAt,
          status: requestData.status
        }));
      }
    } catch (e: any) {
      console.error("[CertificateService] Failed to fetch all requests:", e.message || e);
    }
    return [];
  },

  /**
   * Transition request status using secure backend endpoint
   */
  async updateRequestStatus(requestId: string, status: string, remarks: string, userEmail: string): Promise<boolean> {
    try {
      const response = await axios.put(`/api/forms/certificate/${requestId}/status`, {
        status,
        remarks
      });
      if (response.data && response.data.success) {
        await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
        return true;
      }
    } catch (e: any) {
      console.error("[CertificateService] backend updateRequestStatus failed:", e.message || e);
    }
    return false;
  }
};
