import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Interfaces matching database columns
export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url?: string;
  file_url?: string;
  category: string;
  author: string;
  date: string;
  status: "draft" | "published" | "archived";
  barangay_id?: string | null;
  created_at?: string;
}

export interface DownloadableItem {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_size: string;
  status: "draft" | "published";
  created_at?: string;
}

export interface TourismSpotItem {
  id: string;
  name: string;
  description: string;
  gallery_images: string[];
  location: string;
  google_maps_link?: string;
  opening_hours: string;
  contact_details?: string;
  featured_image?: string;
  created_at?: string;
}

export interface OfficialItem {
  id: string;
  name: string;
  role: string;
  level: number;
  display_order: number;
  image_url?: string;
  biography?: string;
  contact_info?: string;
  department?: string;
  created_at?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  description: string;
  head_of_office?: string;
  contact_number?: string;
  email?: string;
  office_hours: string;
  location?: string;
  created_at?: string;
}

export interface ServiceCmsItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  purpose?: string;
  requirements: string[];
  processing_time: string;
  fees: string;
  office_responsible: string;
  office_hours: string;
  contact_info?: string;
  physical_address?: string;
  status: "available" | "coming-soon" | "maintenance";
  downloadable_forms?: Array<{ title: string; url: string; fileSize: string }>;
  created_at?: string;
}

export interface CitizensCharterCmsItem {
  id: string;
  office: string;
  service_name: string;
  requirements: string[];
  processing_time: string;
  fees: string;
  steps: Array<{
    stepNumber: number;
    activity: string;
    officeResponsible: string;
    duration: string;
    clientSteps: string;
  }>;
  downloadable_forms?: Array<{ title: string; url: string; fileSize: string }>;
  created_at?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  banner_image?: string;
  created_at?: string;
}

export interface AuditLogItem {
  id: string;
  user_email: string;
  action: string;
  target_table: string;
  target_id: string;
  timestamp: string;
}

export interface UserProfileItem {
  id: string;
  email: string;
  full_name?: string;
  role: "super_admin" | "admin" | "editor" | "municipal_admin" | "barangay_admin";
  barangay_id?: string | null;
  department_id?: string | null;
  is_verified: boolean;
  created_at?: string;
}

// Initial Data helpers for LocalStorage fallback
const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Talibon Secures Outstanding Ranking in National Competitiveness Index",
    slug: "talibon-national-competitiveness-ranking",
    summary: "The Municipality of Talibon ranks 17th among 1st and 2nd class municipalities nationwide on the Cities and Municipalities Competitiveness Index (CMCI).",
    content: "The Department of Trade and Industry (DTI) recognized Talibon for its outstanding performance in economic dynamism, government efficiency, infrastructure development, and resiliency. Mayor Janette Aurestila-Garcia expressed her appreciation to the local municipal staff and citizens who worked tirelessly to implement modernization reforms.",
    category: "UPDATE",
    author: "Municipal Administrator",
    date: new Date().toISOString().split("T")[0],
    status: "published",
  }
];

const INITIAL_DOWNLOADS: DownloadableItem[] = [
  {
    id: "dl-1",
    title: "Unified Business Permit Application Form 2026",
    description: "Standard application form for new business registrations and renewals.",
    category: "forms",
    file_url: "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf",
    file_size: "1.4 MB",
    status: "published",
  },
  {
    id: "dl-2",
    title: "Unified Application Form for Building Permit",
    description: "Required for all structural and civil engineering construction clearances.",
    category: "forms",
    file_url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf",
    file_size: "2.1 MB",
    status: "published",
  }
];

const INITIAL_TOURISM: TourismSpotItem[] = [
  {
    id: "tour-1",
    name: "Danajon Bank Double Barrier Reef",
    description: "The only double barrier reef in the Philippines and one of only six in the entire world. It offers magnificent underwater biodiversity and stunning sandbars like Calituban Island.",
    gallery_images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800"],
    location: "Camotes Sea, Off northern coast of Talibon",
    opening_hours: "24/7 (Boat schedules vary)",
    contact_details: "Municipal Tourism Office: tourism@talibon.gov.ph",
    featured_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tour-2",
    name: "San Pedro Calungsod Beach",
    description: "A serene public beach offering golden sand shoreline, crystal clear waters, and local food stalls. Ideal for weekend family picnics.",
    gallery_images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"],
    location: "Brgy. San Pedro, Talibon, Bohol",
    opening_hours: "6:00 AM - 10:00 PM",
    contact_details: "Barangay San Pedro Secretariat",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
  }
];

const INITIAL_OFFICIALS: OfficialItem[] = [
  {
    id: "off-1",
    name: "Hon. Janette Aurestila-Garcia",
    role: "Municipal Mayor",
    level: 1,
    display_order: 1,
    image_url: "",
    biography: "Serving as Municipal Mayor of Talibon, focusing on sustainable agro-industrial and marine resource growth.",
    contact_info: "mayor@talibon.gov.ph",
    department: "Mayor's Office"
  },
  {
    id: "off-2",
    name: "Hon. Dave Aurestila",
    role: "Municipal Vice Mayor",
    level: 2,
    display_order: 2,
    image_url: "",
    biography: "Presiding Officer of the Sangguniang Bayan, championing progressive local legislation.",
    contact_info: "vicemayor@talibon.gov.ph",
    department: "Legislative Department"
  }
];

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-1",
    name: "Business Permits and Licensing Office (BPLO)",
    description: "Processes applications for commercial licenses, municipal clearances, and business regulatory forms.",
    head_of_office: "Atty. Ryan Valeroso",
    contact_number: "(038) 422-2895",
    email: "bplo-talibon@gov.ph",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Executive Building",
  },
  {
    id: "dept-2",
    name: "Municipal Treasurer's Office (MTO)",
    description: "Schedules, processes, and manages collection of real property taxes, community tax certificates, and permit dues.",
    head_of_office: "Mrs. Maria Clara Santos, CPA",
    contact_number: "(038) 422-2110",
    email: "treasury-talibon@gov.ph",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Main Lobby",
  }
];

const INITIAL_SERVICES: ServiceCmsItem[] = [
  {
    id: "apply-permit",
    name: "Apply for Permit",
    slug: "apply-permit",
    description: "Secure municipal permits, zoning clearance, and construction approvals required for business operations and physical structures.",
    purpose: "To regulate, monitor, and support business establishment and infrastructure development within Talibon in compliance with local ordinances, the National Building Code, and zoning regulations.",
    requirements: [
      "Unified Application Form (properly accomplished and notarized)",
      "Barangay Clearance for Business or Construction",
      "Valid Government-issued ID of the owner/applicant",
      "Occupancy Permit / Zoning Clearance",
      "Contract of Lease (if renting) or Land Title / Tax Declaration (if owned)",
      "Fire Safety Inspection Certificate (FSIC)"
    ],
    processing_time: "3 to 5 business days from submission of complete requirements",
    fees: "Varies based on assessment (BPLO / Engineering rules)",
    office_responsible: "Business Permits and Licensing Office (BPLO)",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contact_info: "Phone: (038) 422-2895 | Email: bplo-talibon@gov.ph",
    physical_address: "Ground Floor, Executive Building, Talibon Municipal Hall, Bohol, Philippines",
    status: "available",
    downloadable_forms: [
      { title: "Business Permit Application Form", url: "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf", fileSize: "1.4 MB" },
      { title: "Unified Application Form for Building Permit", url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf", fileSize: "2.1 MB" }
    ]
  },
  {
    id: "request-certificate",
    name: "Request Certificate",
    slug: "request-certificate",
    description: "Obtain official civil registry documents, local clearances, residency certifications, and other municipal vital records.",
    purpose: "To provide legal certifications, civil registry records, and citizen clearances required for employment, legal purposes, travel, identification, or financial services.",
    requirements: [
      "Duly accomplished Request Slip / Application Form",
      "Valid Government-issued Identification Card (original and photocopy)",
      "Proof of Payment (Official Receipt from the Municipal Treasurer)"
    ],
    processing_time: "Same day processing (15 to 45 minutes for walk-in requests)",
    fees: "₱100.00 standard certification fee",
    office_responsible: "Local Civil Registry Office (LCRO) / Mayor's Office",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contact_info: "Phone: (038) 422-2023 | Email: civilregistry-talibon@gov.ph",
    physical_address: "First Floor, Legislative Annex, Talibon Municipal Hall, Bohol, Philippines",
    status: "available",
    downloadable_forms: [
      { title: "Barangay Residency Request Form", url: "#", fileSize: "450 KB" }
    ]
  }
];

const INITIAL_CHARTERS: CitizensCharterCmsItem[] = [
  {
    id: "cc-1",
    office: "Office of the Municipal Mayor",
    service_name: "Issuance of Mayor's Clearance",
    requirements: [
      "Police Clearance (Current)",
      "Official Receipt from Municipal Treasurer",
      "Barangay Clearance"
    ],
    processing_time: "15 Minutes",
    fees: "₱150.00",
    steps: [
      { stepNumber: 1, activity: "Submit requirements and fill out application form", officeResponsible: "Mayor's Office Secretariat", duration: "5 minutes", clientSteps: "Approach receiving desk and hand in documents" },
      { stepNumber: 2, activity: "Review, verification, and print of clearance", officeResponsible: "Mayor's Staff", duration: "5 minutes", clientSteps: "Wait in the lobby" },
      { stepNumber: 3, activity: "Signing and official stamping of clearance", officeResponsible: "Municipal Mayor / Authorized Rep", duration: "3 minutes", clientSteps: "Wait in the lobby" },
      { stepNumber: 4, activity: "Release of Mayor's Clearance", officeResponsible: "Releasing Clerk", duration: "2 minutes", clientSteps: "Present ID and receive clearance" }
    ]
  }
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Talibon Annual Town Fiesta",
    description: "A grand cultural and religious celebration in honor of Blessed Virgin Mary, featuring local pageantry, sports leagues, and sea-sports competitions on Danajon Bank.",
    date: "2026-10-08",
    time: "8:00 AM - 11:00 PM",
    venue: "Talibon Town Plaza & Cultural Center",
    banner_image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"
  }
];

const INITIAL_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    user_email: "superadmin@talibon.gov.ph",
    action: "CREATED",
    target_table: "news",
    target_id: "news-1",
    timestamp: new Date().toISOString()
  }
];

const INITIAL_USERS: UserProfileItem[] = [
  {
    id: "usr-1",
    email: "superadmin@talibon.gov.ph",
    full_name: "Municipal Admin",
    role: "super_admin",
    is_verified: true,
    department_id: null,
    barangay_id: null,
  },
  {
    id: "usr-2",
    email: "editor1@talibon.gov.ph",
    full_name: "Municipal Editor",
    role: "editor",
    is_verified: true,
    department_id: "dept-1", // BPLO
    barangay_id: null,
  },
  {
    id: "usr-3",
    email: "bplostaff@talibon.gov.ph",
    full_name: "BPLO Licensing Clerk",
    role: "municipal_admin",
    is_verified: true,
    department_id: "dept-1", // BPLO
    barangay_id: null,
  },
  {
    id: "usr-4",
    email: "treasurystaff@talibon.gov.ph",
    full_name: "MTO Cashier",
    role: "editor",
    is_verified: true,
    department_id: "dept-2", // MTO (Treasury)
    barangay_id: null,
  },
  {
    id: "usr-5",
    email: "sanpedroadmin@talibon.gov.ph",
    full_name: "San Pedro Brgy Secretary",
    role: "barangay_admin",
    is_verified: true,
    department_id: null,
    barangay_id: "san_pedro",
  }
];

// LocalStorage Helper functions
function getStorage<T>(key: string, defaults: T[]): T[] {
  const data = localStorage.getItem(`cms_data:${key}`);
  if (!data) {
    localStorage.setItem(`cms_data:${key}`, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
}

function setStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(`cms_data:${key}`, JSON.stringify(data));
}

// Low-level helper to track actions in audit logs
export const logCmsAction = async (userEmail: string, action: string, table: string, targetId: string) => {
  const email = userEmail || "anonymous@talibon.gov.ph";
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from("audit_logs").insert([{
        user_email: email,
        action,
        target_table: table,
        target_id: targetId
      }]);
      if (error) throw error;
    } catch (e: any) {
      console.warn("Could not insert Supabase audit log:", e.message || e);
    }
  }

  const localLog: AuditLogItem = {
    id: "mock-" + Math.random().toString(36).substring(2, 9),
    user_email: email,
    action,
    target_table: table,
    target_id: targetId,
    timestamp
  };
  const logs = getStorage<AuditLogItem>("audit_logs", INITIAL_LOGS);
  logs.unshift(localLog);
  setStorage("audit_logs", logs.slice(0, 50)); // limit logs to last 50
};

export const cmsService = {
  // Stats overview
  async getDashboardStats() {
    try {
      const news = await this.getNews();
      const downloadables = await this.getDownloadables();
      const tourism = await this.getTourismSpots();
      const officials = await this.getOfficials();
      const departments = await this.getDepartments();
      const services = await this.getServices();
      const events = await this.getEvents();

      return {
        totalNews: news.length,
        totalDownloadables: downloadables.length,
        totalTourism: tourism.length,
        totalOfficials: officials.length,
        totalDepartments: departments.length,
        totalServices: services.length,
        totalEvents: events.length
      };
    } catch (e) {
      return {
        totalNews: 0,
        totalDownloadables: 0,
        totalTourism: 0,
        totalOfficials: 0,
        totalDepartments: 0,
        totalServices: 0,
        totalEvents: 0
      };
    }
  },

  // News CRUD
  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("news").select("*").order("date", { ascending: false });
        if (error) throw error;
        if (data) return data as NewsItem[];
      } catch (e: any) {
        console.error("Supabase News fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<NewsItem>("news", INITIAL_NEWS);
  },

  async createNews(item: Omit<NewsItem, "id">, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("news").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "news", data.id);
          return data as NewsItem;
        }
      } catch (e: any) {
        console.error("Supabase News insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as NewsItem;
    const list = getStorage<NewsItem>("news", INITIAL_NEWS);
    list.unshift(newItem);
    setStorage("news", list);
    await logCmsAction(userEmail, "CREATE", "news", id);
    return newItem;
  },

  async updateNews(id: string, item: Partial<NewsItem>, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("news").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "news", id);
          return data as NewsItem;
        }
      } catch (e: any) {
        console.error("Supabase News update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<NewsItem>("news", INITIAL_NEWS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("news", list);
      await logCmsAction(userEmail, "UPDATE", "news", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteNews(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("news").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "news", id);
        return true;
      } catch (e: any) {
        console.error("Supabase News delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<NewsItem>("news", INITIAL_NEWS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("news", filtered);
    await logCmsAction(userEmail, "DELETE", "news", id);
    return true;
  },

  // Downloadables CRUD
  async getDownloadables(): Promise<DownloadableItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("downloadables").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data as DownloadableItem[];
      } catch (e: any) {
        console.error("Supabase Downloadables fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<DownloadableItem>("downloadables", INITIAL_DOWNLOADS);
  },

  async createDownloadable(item: Omit<DownloadableItem, "id">, userEmail: string): Promise<DownloadableItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("downloadables").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "downloadables", data.id);
          return data as DownloadableItem;
        }
      } catch (e: any) {
        console.error("Supabase Downloadables insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as DownloadableItem;
    const list = getStorage<DownloadableItem>("downloadables", INITIAL_DOWNLOADS);
    list.unshift(newItem);
    setStorage("downloadables", list);
    await logCmsAction(userEmail, "CREATE", "downloadables", id);
    return newItem;
  },

  async updateDownloadable(id: string, item: Partial<DownloadableItem>, userEmail: string): Promise<DownloadableItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("downloadables").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "downloadables", id);
          return data as DownloadableItem;
        }
      } catch (e: any) {
        console.error("Supabase Downloadables update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<DownloadableItem>("downloadables", INITIAL_DOWNLOADS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("downloadables", list);
      await logCmsAction(userEmail, "UPDATE", "downloadables", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteDownloadable(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("downloadables").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "downloadables", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Downloadables delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<DownloadableItem>("downloadables", INITIAL_DOWNLOADS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("downloadables", filtered);
    await logCmsAction(userEmail, "DELETE", "downloadables", id);
    return true;
  },

  // Tourism CRUD
  async getTourismSpots(): Promise<TourismSpotItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("tourism_spots").select("*");
        if (error) throw error;
        if (data) return data as TourismSpotItem[];
      } catch (e: any) {
        console.error("Supabase Tourism spots fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<TourismSpotItem>("tourism_spots", INITIAL_TOURISM);
  },

  async createTourismSpot(item: Omit<TourismSpotItem, "id">, userEmail: string): Promise<TourismSpotItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("tourism_spots").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "tourism_spots", data.id);
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        console.error("Supabase Tourism insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as TourismSpotItem;
    const list = getStorage<TourismSpotItem>("tourism_spots", INITIAL_TOURISM);
    list.unshift(newItem);
    setStorage("tourism_spots", list);
    await logCmsAction(userEmail, "CREATE", "tourism_spots", id);
    return newItem;
  },

  async updateTourismSpot(id: string, item: Partial<TourismSpotItem>, userEmail: string): Promise<TourismSpotItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("tourism_spots").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        console.error("Supabase Tourism update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<TourismSpotItem>("tourism_spots", INITIAL_TOURISM);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("tourism_spots", list);
      await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteTourismSpot(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("tourism_spots").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Tourism delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<TourismSpotItem>("tourism_spots", INITIAL_TOURISM);
    const filtered = list.filter(n => n.id !== id);
    setStorage("tourism_spots", filtered);
    await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
    return true;
  },

  // Officials CRUD (Reuses 'officials' table)
  async getOfficials(): Promise<OfficialItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").select("*").order("level", { ascending: true }).order("display_order", { ascending: true });
        if (error) throw error;
        if (data) return data as OfficialItem[];
      } catch (e: any) {
        console.error("Supabase Officials fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
  },

  async createOfficial(item: Omit<OfficialItem, "id">, userEmail: string): Promise<OfficialItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "officials", data.id);
          return data as OfficialItem;
        }
      } catch (e: any) {
        console.error("Supabase Officials insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as OfficialItem;
    const list = getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
    list.push(newItem);
    setStorage("officials", list);
    await logCmsAction(userEmail, "CREATE", "officials", id);
    return newItem;
  },

  async updateOfficial(id: string, item: Partial<OfficialItem>, userEmail: string): Promise<OfficialItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "officials", id);
          return data as OfficialItem;
        }
      } catch (e: any) {
        console.error("Supabase Officials update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("officials", list);
      await logCmsAction(userEmail, "UPDATE", "officials", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteOfficial(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("officials").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "officials", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Officials delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("officials", filtered);
    await logCmsAction(userEmail, "DELETE", "officials", id);
    return true;
  },

  // Departments CRUD
  async getDepartments(): Promise<DepartmentItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });
        if (error) throw error;
        if (data) return data as DepartmentItem[];
      } catch (e: any) {
        console.error("Supabase Departments fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
  },

  async createDepartment(item: Omit<DepartmentItem, "id">, userEmail: string): Promise<DepartmentItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("departments").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "departments", data.id);
          return data as DepartmentItem;
        }
      } catch (e: any) {
        console.error("Supabase Departments insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as DepartmentItem;
    const list = getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
    list.push(newItem);
    setStorage("departments", list);
    await logCmsAction(userEmail, "CREATE", "departments", id);
    return newItem;
  },

  async updateDepartment(id: string, item: Partial<DepartmentItem>, userEmail: string): Promise<DepartmentItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("departments").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "departments", id);
          return data as DepartmentItem;
        }
      } catch (e: any) {
        console.error("Supabase Departments update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("departments", list);
      await logCmsAction(userEmail, "UPDATE", "departments", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteDepartment(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("departments").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "departments", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Departments delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("departments", filtered);
    await logCmsAction(userEmail, "DELETE", "departments", id);
    return true;
  },

  // Services CMS CRUD
  async getServices(): Promise<ServiceCmsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("services_cms").select("*");
        if (error) throw error;
        if (data) return data as ServiceCmsItem[];
      } catch (e: any) {
        console.error("Supabase Services fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<ServiceCmsItem>("services_cms", INITIAL_SERVICES);
  },

  async createService(item: Omit<ServiceCmsItem, "id">, userEmail: string): Promise<ServiceCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("services_cms").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "services_cms", data.id);
          return data as ServiceCmsItem;
        }
      } catch (e: any) {
        console.error("Supabase Services insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as ServiceCmsItem;
    const list = getStorage<ServiceCmsItem>("services_cms", INITIAL_SERVICES);
    list.push(newItem);
    setStorage("services_cms", list);
    await logCmsAction(userEmail, "CREATE", "services_cms", id);
    return newItem;
  },

  async updateService(id: string, item: Partial<ServiceCmsItem>, userEmail: string): Promise<ServiceCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("services_cms").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "services_cms", id);
          return data as ServiceCmsItem;
        }
      } catch (e: any) {
        console.error("Supabase Services update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<ServiceCmsItem>("services_cms", INITIAL_SERVICES);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("services_cms", list);
      await logCmsAction(userEmail, "UPDATE", "services_cms", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteService(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("services_cms").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "services_cms", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Services delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<ServiceCmsItem>("services_cms", INITIAL_SERVICES);
    const filtered = list.filter(n => n.id !== id);
    setStorage("services_cms", filtered);
    await logCmsAction(userEmail, "DELETE", "services_cms", id);
    return true;
  },

  // Citizens Charter CRUD
  async getCitizensCharter(): Promise<CitizensCharterCmsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("citizens_charter_cms").select("*");
        if (error) throw error;
        if (data) return data as CitizensCharterCmsItem[];
      } catch (e: any) {
        console.error("Supabase Citizen Charter fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
  },

  async createCitizensCharter(item: Omit<CitizensCharterCmsItem, "id">, userEmail: string): Promise<CitizensCharterCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("citizens_charter_cms").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "citizens_charter_cms", data.id);
          return data as CitizensCharterCmsItem;
        }
      } catch (e: any) {
        console.error("Supabase Citizen Charter insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as CitizensCharterCmsItem;
    const list = getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
    list.push(newItem);
    setStorage("citizens_charter_cms", list);
    await logCmsAction(userEmail, "CREATE", "citizens_charter_cms", id);
    return newItem;
  },

  async updateCitizensCharter(id: string, item: Partial<CitizensCharterCmsItem>, userEmail: string): Promise<CitizensCharterCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("citizens_charter_cms").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "citizens_charter_cms", id);
          return data as CitizensCharterCmsItem;
        }
      } catch (e: any) {
        console.error("Supabase Citizen Charter update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("citizens_charter_cms", list);
      await logCmsAction(userEmail, "UPDATE", "citizens_charter_cms", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteCitizensCharter(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("citizens_charter_cms").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "citizens_charter_cms", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Citizen Charter delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("citizens_charter_cms", filtered);
    await logCmsAction(userEmail, "DELETE", "citizens_charter_cms", id);
    return true;
  },

  // Events CRUD
  async getEvents(): Promise<EventItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
        if (error) throw error;
        if (data) return data as EventItem[];
      } catch (e: any) {
        console.error("Supabase Events fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<EventItem>("events", INITIAL_EVENTS);
  },

  async createEvent(item: Omit<EventItem, "id">, userEmail: string): Promise<EventItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("events").insert([item]).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "events", data.id);
          return data as EventItem;
        }
      } catch (e: any) {
        console.error("Supabase Events insert failed:", e.message || e);
        throw e;
      }
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as EventItem;
    const list = getStorage<EventItem>("events", INITIAL_EVENTS);
    list.unshift(newItem);
    setStorage("events", list);
    await logCmsAction(userEmail, "CREATE", "events", id);
    return newItem;
  },

  async updateEvent(id: string, item: Partial<EventItem>, userEmail: string): Promise<EventItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("events").update(item).eq("id", id).select().single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "events", id);
          return data as EventItem;
        }
      } catch (e: any) {
        console.error("Supabase Events update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<EventItem>("events", INITIAL_EVENTS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("events", list);
      await logCmsAction(userEmail, "UPDATE", "events", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteEvent(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "events", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Events delete failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<EventItem>("events", INITIAL_EVENTS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("events", filtered);
    await logCmsAction(userEmail, "DELETE", "events", id);
    return true;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(100);
        if (error) throw error;
        if (data) return data as AuditLogItem[];
      } catch (e: any) {
        console.error("Supabase Audit Logs fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<AuditLogItem>("audit_logs", INITIAL_LOGS);
  },

  // Users Management
  async getUsers(): Promise<UserProfileItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        if (data) return data as UserProfileItem[];
      } catch (e: any) {
        console.error("Supabase profiles query failed, falling back to LocalStorage:", e.message || e);
      }
    }
    return getStorage<UserProfileItem>("users", INITIAL_USERS);
  },

  async updateUserRole(
    id: string,
    role: string,
    isVerified: boolean,
    userEmail: string,
    departmentId?: string | null,
    barangayId?: string | null
  ): Promise<UserProfileItem> {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: any = { role, is_verified: isVerified };
        if (departmentId !== undefined) updatePayload.department_id = departmentId;
        if (barangayId !== undefined) updatePayload.barangay_id = barangayId;

        const { data, error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE_USER", "profiles", id);
          return data as UserProfileItem;
        }
      } catch (e: any) {
        console.error("Supabase profiles update failed:", e.message || e);
        throw e;
      }
    }

    const list = getStorage<UserProfileItem>("users", INITIAL_USERS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      const updatedItem = { ...list[index], role: role as any, is_verified: isVerified };
      if (departmentId !== undefined) updatedItem.department_id = departmentId;
      if (barangayId !== undefined) updatedItem.barangay_id = barangayId;
      list[index] = updatedItem;
      setStorage("users", list);
      await logCmsAction(userEmail, "UPDATE_USER", "profiles", id);
      return list[index];
    }
    throw new Error("User not found");
  }
};
