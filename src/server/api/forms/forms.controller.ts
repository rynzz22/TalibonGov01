import { Controller, Get, Post, Body, Param, Inject } from "@nestjs/common";
import { FormsService } from "./forms.service";

@Controller("api/forms")
export class FormsController {
  constructor(@Inject(FormsService) private readonly formsService: FormsService) {}

  @Post("certificate")
  async submitRequest(@Body() payload: any) {
    return this.formsService.submitRequest(payload);
  }

  @Get("certificate/:ticketId")
  async getRequestStatus(@Param("ticketId") ticketId: string) {
    const request = await this.formsService.getRequestStatus(ticketId);
    if (!request) {
      return { success: false, message: "Ticket ID not found." };
    }
    return { success: true, request };
  }

  @Get("downloadable")
  getDownloadable() {
    return this.formsService.getDownloadable();
  }

  @Get("business-permits")
  getBusinessPermits() {
    return this.formsService.getBusinessPermits();
  }

  @Get("building-permits")
  getBuildingPermits() {
    return this.formsService.getBuildingPermits();
  }

  @Get("zoning-clearance")
  getZoningClearance() {
    return this.formsService.getZoningClearance();
  }
}
