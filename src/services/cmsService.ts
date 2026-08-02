import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { newsService } from "./newsService";
import { eventService } from "./eventService";
import { tourismService } from "./tourismService";
import { downloadablesService } from "./downloadablesService";
import { servicesCmsService } from "./servicesCmsService";
import { isMockAllowed } from "../lib/mode";

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

export interface BarangayItem {
  id: string;
  name: string;
  captain: string | null;
  population: number;
  contact_number?: string | null;
  office_address?: string | null;
  office_hours?: string | null;
  cover_image?: string | null;
  created_at?: string;
  updated_at?: string;
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

export interface EmergencyAdvisoryItem {
  id: string;
  title: string;
  type: string;
  severity: "info" | "warning" | "critical" | "danger";
  content: string;
  affected_barangays: string[];
  is_pinned: boolean;
  is_popup: boolean;
  banner_color: string;
  status: "draft" | "published" | "archived";
  start_date?: string;
  expiry_date?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InfrastructureProjectItem {
  id: string;
  project_code: string;
  title: string;
  category: string;
  description: string;
  status: "planning" | "procurement" | "ongoing" | "delayed" | "completed";
  budget: number;
  funding_source: string;
  contractor?: string;
  project_engineer?: string;
  barangay: string;
  latitude?: number;
  longitude?: number;
  progress_percentage: number;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InfrastructureUpdateItem {
  id: string;
  project_id: string;
  update_title: string;
  update_description?: string;
  progress_percentage?: number;
  milestone_reached?: string;
  updated_by?: string;
  created_at?: string;
}

export interface LegislativeDocumentItem {
  id: string;
  document_type: "ordinance" | "resolution" | "executive_order" | "memorandum";
  document_number: string;
  title: string;
  category: string;
  summary?: string;
  full_text?: string;
  file_url?: string;
  publication_date?: string;
  effective_date?: string;
  status: "draft" | "published" | "archived";
  views_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string;
  color?: string;
  created_at?: string;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface HomepageWidgetItem {
  id: string;
  widget_type: string;
  title: string;
  subtitle?: string;
  config?: any;
  is_enabled: boolean;
  widget_order: number;
  start_date?: string;
  end_date?: string;
  updated_at?: string;
}

export interface HomepageSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_label?: string;
  cta_url?: string;
  slide_order: number;
  is_enabled: boolean;
  created_at?: string;
}

export interface PageContentItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  status: "draft" | "published" | "archived";
  meta_title?: string;
  meta_description?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PageBlockItem {
  id: string;
  page_id: string;
  block_type: string;
  content: any;
  block_order: number;
  is_enabled: boolean;
  created_at?: string;
}

export interface MediaAssetItem {
  id: string;
  folder_id?: string | null;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  alt_text?: string;
  caption?: string;
  width?: number;
  height?: number;
  usage_count?: number;
  created_at?: string;
}

export interface MediaFolderItem {
  id: string;
  name: string;
  parent_id?: string | null;
  path: string;
  created_at?: string;
}

export interface ModulePermissionItem {
  id: string;
  role: string;
  module: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_publish: boolean;
  updated_at?: string;
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
    department: "mayor"
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
    department: "sb"
  }
];

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "bplo",
    name: "Business Permits and Licensing Office (BPLO)",
    description: "Processes applications for commercial licenses, municipal clearances, and business regulatory forms.",
    head_of_office: "Atty. Ryan Valeroso",
    contact_number: "(038) 422-2895",
    email: "bplo-talibon@gov.ph",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Executive Building",
  },
  {
    id: "treasury",
    name: "Municipal Treasurer's Office (MTO)",
    description: "Schedules, processes, and manages collection of real property taxes, community tax certificates, and permit dues.",
    head_of_office: "Mrs. Maria Clara Santos, CPA",
    contact_number: "(038) 422-2110",
    email: "treasury-talibon@gov.ph",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    location: "Ground Floor, Main Lobby",
  }
];

export const INITIAL_BARANGAYS: BarangayItem[] = [
  { id: "poblacion", name: "Poblacion", captain: "Hon. Juan dela Cruz", population: 4500, contact_number: "+63 912 345 6789", office_address: "Barangay Hall, Poblacion, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_francisco", name: "San Francisco", captain: "Hon. Maria Clara", population: 3200, contact_number: "+63 923 456 7890", office_address: "Barangay Hall, San Francisco, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_jose", name: "San Jose", captain: "Hon. Jose Rizal", population: 2800, contact_number: "+63 934 567 8901", office_address: "Barangay Hall, San Jose, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_agustin", name: "San Agustin", captain: "Hon. Andres Bonifacio", population: 1900, contact_number: "+63 945 678 9012", office_address: "Barangay Hall, San Agustin, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_roque", name: "San Roque", captain: "Hon. Emilio Aguinaldo", population: 2100, contact_number: "+63 956 789 0123", office_address: "Barangay Hall, San Roque, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_isidro", name: "San Isidro", captain: "Hon. Apolinario Mabini", population: 1500, contact_number: "+63 967 890 1234", office_address: "Barangay Hall, San Isidro, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "santo_nino", name: "Santo Niño", captain: "Hon. Melchora Aquino", population: 1100, contact_number: "+63 978 901 2345", office_address: "Barangay Hall, Santo Niño, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_pedro", name: "San Pedro", captain: "Hon. Marcelo H. del Pilar", population: 3800, contact_number: "+63 989 012 3456", office_address: "Barangay Hall, San Pedro, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "tanghaligue", name: "Tanghaligue", captain: "Hon. Gregorio del Pilar", population: 2400, contact_number: "+63 990 123 4567", office_address: "Barangay Hall, Tanghaligue, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "bagacay", name: "Bagacay", captain: "Hon. Gabriela Silang", population: 1700, contact_number: "+63 901 234 5678", office_address: "Barangay Hall, Bagacay, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "balintawak", name: "Balintawak", captain: "Hon. Francisco Balagtas", population: 1200, contact_number: "+63 912 345 6780", office_address: "Barangay Hall, Balintawak, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "burgos", name: "Burgos", captain: "Hon. Diego Silang", population: 850, contact_number: "+63 923 456 7891", office_address: "Barangay Hall, Burgos, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "cantomimbo", name: "Cantomimbo", captain: "Hon. Juan Luna", population: 1300, contact_number: "+63 934 567 8902", office_address: "Barangay Hall, Cantomimbo, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "guindacpan", name: "Guindacpan", captain: "Hon. Macario Sakay", population: 2200, contact_number: "+63 945 678 9013", office_address: "Barangay Hall, Guindacpan, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "magsaysay", name: "Magsaysay", captain: "Hon. Ramon Magsaysay", population: 1450, contact_number: "+63 956 789 0124", office_address: "Barangay Hall, Magsaysay, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "mahanay", name: "Mahanay", captain: "Hon. Carlos P. Garcia", population: 3100, contact_number: "+63 967 890 1235", office_address: "Barangay Hall, Mahanay, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "masacon", name: "Masacon", captain: "Hon. Jose Abad Santos", population: 980, contact_number: "+63 978 901 2346", office_address: "Barangay Hall, Masacon, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "nonoc", name: "Nonoc", captain: "Hon. Manuel L. Quezon", population: 1600, contact_number: "+63 989 012 3457", office_address: "Barangay Hall, Nonoc, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_carlos", name: "San Carlos", captain: "Hon. Sergio Osmeña", population: 1150, contact_number: "+63 990 123 4568", office_address: "Barangay Hall, San Carlos, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_gregorio", name: "San Gregorio", captain: "Hon. Elpidio Quirino", population: 750, contact_number: "+63 901 234 5679", office_address: "Barangay Hall, San Gregorio, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "san_juan", name: "San Juan", captain: "Hon. Diosdado Macapagal", population: 2050, contact_number: "+63 912 345 6781", office_address: "Barangay Hall, San Juan, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "santa_cruz", name: "Santa Cruz", captain: "Hon. Ferdinand Marcos", population: 1800, contact_number: "+63 923 456 7892", office_address: "Barangay Hall, Santa Cruz, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "santo_rosario", name: "Santo Rosario", captain: "Hon. Corazon Aquino", population: 950, contact_number: "+63 934 567 8903", office_address: "Barangay Hall, Santo Rosario, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "sikatuna", name: "Sikatuna", captain: "Hon. Datu Sikatuna", population: 1350, contact_number: "+63 945 678 9014", office_address: "Barangay Hall, Sikatuna, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" },
  { id: "suba", name: "Suba", captain: "Hon. Rajah Humabon", population: 2900, contact_number: "+63 956 789 0125", office_address: "Barangay Hall, Suba, Talibon, Bohol", office_hours: "Monday to Friday, 8:00 AM - 5:00 PM" }
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

const INITIAL_ADVISORIES: EmergencyAdvisoryItem[] = [
  {
    id: "adv-1",
    title: "Gale Warning & Coastal Surge Advisory #03",
    type: "WEATHER",
    severity: "warning",
    content: "All small seacrafts and fishing vessels departing from Talibon Port and Calituban Island are advised to suspend voyage due to heavy sea swells.",
    affected_barangays: ["Calituban", "Suba", "San Pedro", "Guindacpan"],
    is_pinned: true,
    is_popup: true,
    banner_color: "amber",
    status: "published",
    start_date: new Date().toISOString()
  },
  {
    id: "adv-2",
    title: "Scheduled Water Main System Maintenance in Poblacion",
    type: "UTILITY",
    severity: "info",
    content: "Talibon Water District will perform valve replacements along San Jose St. Water pressure interruption expected between 1:00 PM and 5:00 PM.",
    affected_barangays: ["Poblacion", "San Jose"],
    is_pinned: false,
    is_popup: false,
    banner_color: "blue",
    status: "published",
    start_date: new Date().toISOString()
  }
];

const INITIAL_PROJECTS: InfrastructureProjectItem[] = [
  {
    id: "proj-1",
    project_code: "INFRA-2026-001",
    title: "Danajon Bank Ecotourism Boardwalk & Research Hub",
    category: "Eco-Tourism",
    description: "Construction of a elevated mangrove boardwalk with marine sanctuary monitoring outpost and solar lighting.",
    status: "ongoing",
    budget: 12500000.00,
    funding_source: "LGU Development Fund 2026",
    contractor: "Visayas Coastal Marine Builders Corp.",
    project_engineer: "Engr. Ricardo Mendoza",
    barangay: "San Pedro",
    latitude: 10.153,
    longitude: 124.322,
    progress_percentage: 75,
    start_date: "2026-01-15",
    target_completion_date: "2026-09-30"
  },
  {
    id: "proj-2",
    project_code: "INFRA-2026-002",
    title: "Talibon Municipal Health Center Modernization Phase II",
    category: "Public Health",
    description: "Two-story extension including digital X-Ray room, diagnostic laboratory, and emergency triage unit.",
    status: "completed",
    budget: 8200000.00,
    funding_source: "DOH Health Facilities Enhancement Program (HFEP)",
    contractor: "Bohol Apex Builders",
    project_engineer: "Engr. Maria Santos",
    barangay: "Poblacion",
    progress_percentage: 100,
    start_date: "2025-06-01",
    actual_completion_date: "2026-02-10"
  }
];

const INITIAL_LEGISLATIVE: LegislativeDocumentItem[] = [
  {
    id: "leg-1",
    document_type: "ordinance",
    document_number: "Ordinance No. 2026-04",
    title: "Comprehensive Environmental Protection & Marine Sanctuary Ordinance of Talibon",
    category: "Environment",
    summary: "Enacting strict penal clauses for illegal fishing and establishing protected marine zones across Danajon Bank.",
    publication_date: "2026-03-15",
    effective_date: "2026-04-01",
    status: "published",
    views_count: 420
  },
  {
    id: "leg-2",
    document_type: "resolution",
    document_number: "Resolution No. 2026-18",
    title: "Resolution Approving the Municipal Annual Investment Plan (AIP) for FY 2026",
    category: "Finance & Budget",
    summary: "Formally adopting the multi-sectoral development budget allocations for social services and infrastructure.",
    publication_date: "2026-01-20",
    effective_date: "2026-01-20",
    status: "published",
    views_count: 310
  },
  {
    id: "leg-3",
    document_type: "executive_order",
    document_number: "EO No. 2026-01",
    title: "Reconstitution of the Municipal Disaster Risk Reduction and Management Council (MDRRMC)",
    category: "Governance & Safety",
    summary: "Re-organizing team assignments, emergency task forces, and command protocols for climate resiliency.",
    publication_date: "2026-01-05",
    effective_date: "2026-01-05",
    status: "published",
    views_count: 185
  },
  {
    id: "leg-4",
    document_type: "memorandum",
    document_number: "MC No. 2026-02",
    title: "Strict Compliance with Civil Service Hours and Digital Attendance Systems",
    category: "Administration",
    summary: "Mandating all municipal personnel to log attendance using the biometric and digital personnel portal.",
    publication_date: "2026-02-01",
    effective_date: "2026-02-01",
    status: "published",
    views_count: 150
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Public Health", slug: "public-health", module: "news", description: "Health alerts and medical missions", color: "#16a34a" },
  { id: "cat-2", name: "Environment", slug: "environment", module: "news", description: "Marine sanctuary and cleanups", color: "#0284c7" },
  { id: "cat-3", name: "Finance & Budget", slug: "finance", module: "transparency", description: "Financial reports and AIPs", color: "#2563eb" },
  { id: "cat-4", name: "Infrastructure", slug: "infrastructure", module: "projects", description: "Public works and engineering", color: "#d97706" }
];

const INITIAL_TAGS: TagItem[] = [
  { id: "tag-1", name: "#DanajonBank", slug: "danajon-bank" },
  { id: "tag-2", name: "#Talibon2026", slug: "talibon-2026" },
  { id: "tag-3", name: "#FullDisclosure", slug: "full-disclosure" },
  { id: "tag-4", name: "#PublicSafety", slug: "public-safety" }
];

const INITIAL_WIDGETS: HomepageWidgetItem[] = [
  { id: "wid-1", widget_type: "hero_banner", title: "Welcome Banner", subtitle: "Main visual banner on homepage", is_enabled: true, widget_order: 1 },
  { id: "wid-2", widget_type: "advisory_alert", title: "Emergency Ticker", subtitle: "Top alert banner for critical notices", is_enabled: true, widget_order: 2 },
  { id: "wid-3", widget_type: "news_slider", title: "Latest News Grid", subtitle: "Highlighted municipal announcements", is_enabled: true, widget_order: 3 },
  { id: "wid-4", widget_type: "projects_highlight", title: "Infrastructure Showcase", subtitle: "Live project progress tracker", is_enabled: true, widget_order: 4 }
];

const INITIAL_SLIDES: HomepageSlideItem[] = [
  { id: "sld-1", title: "Welcome to Municipality of Talibon", subtitle: "Progressive, Inclusive, and Resilient Coastal Community", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200", cta_label: "Explore Services", cta_url: "/services", slide_order: 1, is_enabled: true },
  { id: "sld-2", title: "Home of Danajon Bank Double Barrier Reef", subtitle: "Protecting Our Unique Global Marine Heritage", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200", cta_label: "Learn More", cta_url: "/tourism", slide_order: 2, is_enabled: true }
];

const INITIAL_PAGES: PageContentItem[] = [
  { id: "pg-1", slug: "about", title: "About Municipality of Talibon", subtitle: "History, vision, mission, and municipal profile", status: "published", meta_title: "About Talibon | LGU Portal", meta_description: "Discover the history and governance of Talibon, Bohol." },
  { id: "pg-2", slug: "danajon-sanctuary", title: "Danajon Bank Sanctuary", subtitle: "Ecological treasure and conservation guidelines", status: "published", meta_title: "Danajon Bank | Talibon Tourism", meta_description: "Explore the double barrier reef of Talibon." }
];

const INITIAL_PERMISSIONS: ModulePermissionItem[] = [
  { id: "perm-1", role: "admin", module: "content", can_read: true, can_create: true, can_edit: true, can_delete: true, can_publish: true },
  { id: "perm-2", role: "editor", module: "content", can_read: true, can_create: true, can_edit: true, can_delete: false, can_publish: true },
  { id: "perm-3", role: "municipal_admin", module: "government", can_read: true, can_create: true, can_edit: true, can_delete: false, can_publish: true },
  { id: "perm-4", role: "barangay_admin", module: "barangays", can_read: true, can_create: false, can_edit: true, can_delete: false, can_publish: false }
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
    return newsService.getNews();
  },

  async createNews(item: Omit<NewsItem, "id">, userEmail: string): Promise<NewsItem> {
    return newsService.createNews(item, userEmail);
  },

  async updateNews(id: string, item: Partial<NewsItem>, userEmail: string): Promise<NewsItem> {
    return newsService.updateNews(id, item, userEmail);
  },

  async deleteNews(id: string, userEmail: string): Promise<boolean> {
    return newsService.deleteNews(id, userEmail);
  },

  async publishNewsRpc(newsId: string, userEmail: string): Promise<any> {
    return newsService.publishNewsRpc(newsId, userEmail);
  },

  // Downloadables CRUD
  async getDownloadables(): Promise<DownloadableItem[]> {
    return downloadablesService.getDownloadables();
  },

  async createDownloadable(item: Omit<DownloadableItem, "id">, userEmail: string): Promise<DownloadableItem> {
    return downloadablesService.createDownloadable(item, userEmail);
  },

  async updateDownloadable(id: string, item: Partial<DownloadableItem>, userEmail: string): Promise<DownloadableItem> {
    return downloadablesService.updateDownloadable(id, item, userEmail);
  },

  async deleteDownloadable(id: string, userEmail: string): Promise<boolean> {
    return downloadablesService.deleteDownloadable(id, userEmail);
  },

  // Tourism CRUD
  async getTourismSpots(): Promise<TourismSpotItem[]> {
    return tourismService.getTourismSpots();
  },

  async createTourismSpot(item: Omit<TourismSpotItem, "id">, userEmail: string): Promise<TourismSpotItem> {
    return tourismService.createTourismSpot(item, userEmail);
  },

  async updateTourismSpot(id: string, item: Partial<TourismSpotItem>, userEmail: string): Promise<TourismSpotItem> {
    return tourismService.updateTourismSpot(id, item, userEmail);
  },

  async deleteTourismSpot(id: string, userEmail: string): Promise<boolean> {
    return tourismService.deleteTourismSpot(id, userEmail);
  },

  // Officials CRUD (Reuses 'officials' table)
  async getOfficials(): Promise<OfficialItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").select("*").order("level", { ascending: true }).order("display_order", { ascending: true });
        if (error) throw error;
        if (data) return data as OfficialItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load officials: ${e.message}`);
        }
        console.error("Supabase Officials fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
  },

  async createOfficial(item: Omit<OfficialItem, "id">, userEmail: string): Promise<OfficialItem> {
    const sanitizedItem = {
      ...item,
      department: item.department && item.department.trim() !== "" ? item.department.trim() : null
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").insert([sanitizedItem]).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to save officials.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...sanitizedItem, id } as OfficialItem;
    const list = getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
    list.push(newItem);
    setStorage("officials", list);
    await logCmsAction(userEmail, "CREATE", "officials", id);
    return newItem;
  },

  async updateOfficial(id: string, item: Partial<OfficialItem>, userEmail: string): Promise<OfficialItem> {
    const sanitizedItem = {
      ...item,
      department: item.department !== undefined ? (item.department && item.department.trim() !== "" ? item.department.trim() : null) : undefined
    };
    // remove undefined values so they are not sent to database
    const cleanPayload = Object.fromEntries(
      Object.entries(sanitizedItem).filter(([_, v]) => v !== undefined)
    );
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("officials").update(cleanPayload).eq("id", id).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to update officials.");
    }

    const list = getStorage<OfficialItem>("officials", INITIAL_OFFICIALS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...sanitizedItem };
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to delete officials.");
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
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load departments: ${e.message}`);
        }
        console.error("Supabase Departments fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
  },

  async createDepartment(item: Omit<DepartmentItem, "id">, userEmail: string): Promise<DepartmentItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("departments").insert([item]).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to save departments.");
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
        const { data, error } = await supabase.from("departments").update(item).eq("id", id).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to update departments.");
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to delete departments.");
    }

    const list = getStorage<DepartmentItem>("departments", INITIAL_DEPARTMENTS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("departments", filtered);
    await logCmsAction(userEmail, "DELETE", "departments", id);
    return true;
  },

  // Barangays CRUD
  async getBarangays(): Promise<BarangayItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("barangays").select("*").order("name", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          const fallbackMap = new Map(INITIAL_BARANGAYS.map(b => [b.id, b]));
          return data.map((d: any) => {
            const fallback = fallbackMap.get(d.id);
            return {
              id: d.id,
              name: d.name,
              captain: d.captain,
              population: d.population || 0,
              contact_number: fallback?.contact_number || "",
              office_address: fallback?.office_address || "",
              office_hours: fallback?.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM",
              cover_image: fallback?.cover_image || ""
            };
          });
        }
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load barangays: ${e.message}`);
        }
        console.error("Supabase Barangays fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorage<BarangayItem>("barangays", INITIAL_BARANGAYS);
  },

  async createBarangay(item: Omit<BarangayItem, "id">, userEmail: string): Promise<BarangayItem> {
    const id = item.name.toLowerCase().replace(/\s+/g, "_");
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id,
          name: item.name,
          captain: item.captain,
          population: item.population
        };
        const { data, error } = await supabase.from("barangays").insert([payload]).select().maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "barangays", id);
          return {
            ...item,
            id: data.id,
            name: data.name,
            captain: data.captain,
            population: data.population
          };
        }
      } catch (e: any) {
        console.error("Supabase Barangays insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to save barangays.");
    }

    const newItem = { ...item, id } as BarangayItem;
    const list = getStorage<BarangayItem>("barangays", INITIAL_BARANGAYS);
    list.push(newItem);
    setStorage("barangays", list);
    await logCmsAction(userEmail, "CREATE", "barangays", id);
    return newItem;
  },

  async updateBarangay(id: string, item: Partial<BarangayItem>, userEmail: string): Promise<BarangayItem> {
    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (item.name !== undefined) payload.name = item.name;
        if (item.captain !== undefined) payload.captain = item.captain;
        if (item.population !== undefined) payload.population = item.population;

        const { data, error } = await supabase.from("barangays").update(payload).eq("id", id).select().maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "barangays", id);
          const list = getStorage<BarangayItem>("barangays", INITIAL_BARANGAYS);
          const index = list.findIndex(n => n.id === id);
          if (index !== -1) {
            list[index] = { ...list[index], ...item, name: data.name, captain: data.captain, population: data.population };
            setStorage("barangays", list);
          }
          return {
            ...item,
            id: data.id,
            name: data.name,
            captain: data.captain,
            population: data.population
          } as BarangayItem;
        }
      } catch (e: any) {
        console.error("Supabase Barangays update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to update barangays.");
    }

    const list = getStorage<BarangayItem>("barangays", INITIAL_BARANGAYS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorage("barangays", list);
      await logCmsAction(userEmail, "UPDATE", "barangays", id);
      return list[index];
    }
    throw new Error("Item not found");
  },

  async deleteBarangay(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("barangays").delete().eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "barangays", id);
        return true;
      } catch (e: any) {
        console.error("Supabase Barangays delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to delete barangays.");
    }

    const list = getStorage<BarangayItem>("barangays", INITIAL_BARANGAYS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("barangays", filtered);
    await logCmsAction(userEmail, "DELETE", "barangays", id);
    return true;
  },

  // Services CMS CRUD
  async getServices(): Promise<ServiceCmsItem[]> {
    return servicesCmsService.getServices();
  },

  async createService(item: Omit<ServiceCmsItem, "id">, userEmail: string): Promise<ServiceCmsItem> {
    return servicesCmsService.createService(item, userEmail);
  },

  async updateService(id: string, item: Partial<ServiceCmsItem>, userEmail: string): Promise<ServiceCmsItem> {
    return servicesCmsService.updateService(id, item, userEmail);
  },

  async deleteService(id: string, userEmail: string): Promise<boolean> {
    return servicesCmsService.deleteService(id, userEmail);
  },

  // Citizens Charter CRUD
  async getCitizensCharter(): Promise<CitizensCharterCmsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("citizens_charter_cms").select("*");
        if (error) throw error;
        if (data) return data as CitizensCharterCmsItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load citizens charter: ${e.message}`);
        }
        console.error("Supabase Citizen Charter fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
  },

  async createCitizensCharter(item: Omit<CitizensCharterCmsItem, "id">, userEmail: string): Promise<CitizensCharterCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("citizens_charter_cms").insert([item]).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to save citizens charter.");
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
        const { data, error } = await supabase.from("citizens_charter_cms").update(item).eq("id", id).select().maybeSingle();
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to update citizens charter.");
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

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to delete citizens charter.");
    }

    const list = getStorage<CitizensCharterCmsItem>("citizens_charter_cms", INITIAL_CHARTERS);
    const filtered = list.filter(n => n.id !== id);
    setStorage("citizens_charter_cms", filtered);
    await logCmsAction(userEmail, "DELETE", "citizens_charter_cms", id);
    return true;
  },

  // Events CRUD
  async getEvents(): Promise<EventItem[]> {
    return eventService.getEvents();
  },

  async createEvent(item: Omit<EventItem, "id">, userEmail: string): Promise<EventItem> {
    return eventService.createEvent(item, userEmail);
  },

  async updateEvent(id: string, item: Partial<EventItem>, userEmail: string): Promise<EventItem> {
    return eventService.updateEvent(id, item, userEmail);
  },

  async deleteEvent(id: string, userEmail: string): Promise<boolean> {
    return eventService.deleteEvent(id, userEmail);
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(100);
        if (error) throw error;
        if (data) return data as AuditLogItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load audit logs: ${e.message}`);
        }
        console.error("Supabase Audit Logs fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
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
        if (!isMockAllowed()) {
          throw new Error(`[CMSService] Failed to load users: ${e.message}`);
        }
        console.error("Supabase profiles query failed, falling back to LocalStorage:", e.message || e);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection.");
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

        let { data, error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();
        
        if (error) throw error;

        if (!data) {
          // Fallback: If profile row did not exist, insert it on the fly
          const insertPayload = {
            id,
            email: id + "@talibon.gov.ph",
            role,
            is_verified: isVerified,
            department_id: departmentId || null,
            barangay_id: barangayId || null,
            full_name: "Staff Member"
          };
          const { data: insertData, error: insertError } = await supabase
            .from("profiles")
            .insert([insertPayload])
            .select()
            .maybeSingle();
          
          if (insertError) throw insertError;
          data = insertData;
        }

        if (data) {
          await logCmsAction(userEmail, "UPDATE_USER", "profiles", id);
          return data as UserProfileItem;
        }
      } catch (e: any) {
        console.error("Supabase profiles update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[CMSService] Supabase is unconfigured. Production Mode requires a live database connection to update user roles.");
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
  },

  // Emergency Advisories
  async getEmergencyAdvisories(): Promise<EmergencyAdvisoryItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("emergency_advisories").select("*").order("start_date", { ascending: false });
        if (!error && data) return data as EmergencyAdvisoryItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<EmergencyAdvisoryItem>("emergency_advisories", INITIAL_ADVISORIES);
  },

  async createEmergencyAdvisory(item: Omit<EmergencyAdvisoryItem, "id">, userEmail: string): Promise<EmergencyAdvisoryItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("emergency_advisories").insert([item]).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "CREATE", "emergency_advisories", data.id);
          return data as EmergencyAdvisoryItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<EmergencyAdvisoryItem>("emergency_advisories", INITIAL_ADVISORIES);
    const newItem: EmergencyAdvisoryItem = { ...item, id: "adv-" + Date.now() };
    list.unshift(newItem);
    setStorage("emergency_advisories", list);
    await logCmsAction(userEmail, "CREATE", "emergency_advisories", newItem.id);
    return newItem;
  },

  async updateEmergencyAdvisory(id: string, item: Partial<EmergencyAdvisoryItem>, userEmail: string): Promise<EmergencyAdvisoryItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("emergency_advisories").update(item).eq("id", id).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "UPDATE", "emergency_advisories", id);
          return data as EmergencyAdvisoryItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<EmergencyAdvisoryItem>("emergency_advisories", INITIAL_ADVISORIES);
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      setStorage("emergency_advisories", list);
      await logCmsAction(userEmail, "UPDATE", "emergency_advisories", id);
      return list[idx];
    }
    throw new Error("Advisory not found");
  },

  async deleteEmergencyAdvisory(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("emergency_advisories").delete().eq("id", id);
        if (!error) {
          await logCmsAction(userEmail, "DELETE", "emergency_advisories", id);
          return true;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<EmergencyAdvisoryItem>("emergency_advisories", INITIAL_ADVISORIES);
    setStorage("emergency_advisories", list.filter(a => a.id !== id));
    await logCmsAction(userEmail, "DELETE", "emergency_advisories", id);
    return true;
  },

  // Infrastructure Projects
  async getInfrastructureProjects(): Promise<InfrastructureProjectItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("infrastructure_projects").select("*").order("created_at", { ascending: false });
        if (!error && data) return data as InfrastructureProjectItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<InfrastructureProjectItem>("infrastructure_projects", INITIAL_PROJECTS);
  },

  async createInfrastructureProject(item: Omit<InfrastructureProjectItem, "id">, userEmail: string): Promise<InfrastructureProjectItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("infrastructure_projects").insert([item]).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "CREATE", "infrastructure_projects", data.id);
          return data as InfrastructureProjectItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<InfrastructureProjectItem>("infrastructure_projects", INITIAL_PROJECTS);
    const newItem: InfrastructureProjectItem = { ...item, id: "proj-" + Date.now() };
    list.unshift(newItem);
    setStorage("infrastructure_projects", list);
    await logCmsAction(userEmail, "CREATE", "infrastructure_projects", newItem.id);
    return newItem;
  },

  async updateInfrastructureProject(id: string, item: Partial<InfrastructureProjectItem>, userEmail: string): Promise<InfrastructureProjectItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("infrastructure_projects").update(item).eq("id", id).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "UPDATE", "infrastructure_projects", id);
          return data as InfrastructureProjectItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<InfrastructureProjectItem>("infrastructure_projects", INITIAL_PROJECTS);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      setStorage("infrastructure_projects", list);
      await logCmsAction(userEmail, "UPDATE", "infrastructure_projects", id);
      return list[idx];
    }
    throw new Error("Project not found");
  },

  async deleteInfrastructureProject(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("infrastructure_projects").delete().eq("id", id);
        if (!error) {
          await logCmsAction(userEmail, "DELETE", "infrastructure_projects", id);
          return true;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<InfrastructureProjectItem>("infrastructure_projects", INITIAL_PROJECTS);
    setStorage("infrastructure_projects", list.filter(p => p.id !== id));
    await logCmsAction(userEmail, "DELETE", "infrastructure_projects", id);
    return true;
  },

  // Legislative Documents
  async getLegislativeDocuments(docType?: string): Promise<LegislativeDocumentItem[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from("legislative_documents").select("*").order("publication_date", { ascending: false });
        if (docType) query = query.eq("document_type", docType);
        const { data, error } = await query;
        if (!error && data) return data as LegislativeDocumentItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<LegislativeDocumentItem>("legislative_documents", INITIAL_LEGISLATIVE);
    if (docType) return list.filter(l => l.document_type === docType);
    return list;
  },

  async createLegislativeDocument(item: Omit<LegislativeDocumentItem, "id">, userEmail: string): Promise<LegislativeDocumentItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("legislative_documents").insert([item]).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "CREATE", "legislative_documents", data.id);
          return data as LegislativeDocumentItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<LegislativeDocumentItem>("legislative_documents", INITIAL_LEGISLATIVE);
    const newItem: LegislativeDocumentItem = { ...item, id: "leg-" + Date.now() };
    list.unshift(newItem);
    setStorage("legislative_documents", list);
    await logCmsAction(userEmail, "CREATE", "legislative_documents", newItem.id);
    return newItem;
  },

  async updateLegislativeDocument(id: string, item: Partial<LegislativeDocumentItem>, userEmail: string): Promise<LegislativeDocumentItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("legislative_documents").update(item).eq("id", id).select().maybeSingle();
        if (!error && data) {
          await logCmsAction(userEmail, "UPDATE", "legislative_documents", id);
          return data as LegislativeDocumentItem;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<LegislativeDocumentItem>("legislative_documents", INITIAL_LEGISLATIVE);
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      setStorage("legislative_documents", list);
      await logCmsAction(userEmail, "UPDATE", "legislative_documents", id);
      return list[idx];
    }
    throw new Error("Document not found");
  },

  async deleteLegislativeDocument(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("legislative_documents").delete().eq("id", id);
        if (!error) {
          await logCmsAction(userEmail, "DELETE", "legislative_documents", id);
          return true;
        }
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<LegislativeDocumentItem>("legislative_documents", INITIAL_LEGISLATIVE);
    setStorage("legislative_documents", list.filter(l => l.id !== id));
    await logCmsAction(userEmail, "DELETE", "legislative_documents", id);
    return true;
  },

  // Categories & Tags
  async getCategories(): Promise<CategoryItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
        if (!error && data) return data as CategoryItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<CategoryItem>("categories", INITIAL_CATEGORIES);
  },

  async getTags(): Promise<TagItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name", { ascending: true });
        if (!error && data) return data as TagItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<TagItem>("tags", INITIAL_TAGS);
  },

  // Homepage Widgets & Slides
  async getHomepageWidgets(): Promise<HomepageWidgetItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("homepage_widgets").select("*").order("widget_order", { ascending: true });
        if (!error && data) return data as HomepageWidgetItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<HomepageWidgetItem>("homepage_widgets", INITIAL_WIDGETS);
  },

  async updateHomepageWidget(id: string, item: Partial<HomepageWidgetItem>): Promise<HomepageWidgetItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("homepage_widgets").update(item).eq("id", id).select().maybeSingle();
        if (!error && data) return data as HomepageWidgetItem;
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    const list = getStorage<HomepageWidgetItem>("homepage_widgets", INITIAL_WIDGETS);
    const idx = list.findIndex(w => w.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      setStorage("homepage_widgets", list);
      return list[idx];
    }
    throw new Error("Widget not found");
  },

  async getHomepageSlides(): Promise<HomepageSlideItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("homepage_slides").select("*").order("slide_order", { ascending: true });
        if (!error && data) return data as HomepageSlideItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<HomepageSlideItem>("homepage_slides", INITIAL_SLIDES);
  },

  // Pages
  async getPageContents(): Promise<PageContentItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("page_contents").select("*").order("title", { ascending: true });
        if (!error && data) return data as PageContentItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<PageContentItem>("page_contents", INITIAL_PAGES);
  },

  // Permissions Matrix
  async getModulePermissions(): Promise<ModulePermissionItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from("module_permissions").select("*");
        if (!error && data) return data as ModulePermissionItem[];
      } catch (e: any) {
        if (!isMockAllowed()) throw e;
      }
    }
    return getStorage<ModulePermissionItem>("module_permissions", INITIAL_PERMISSIONS);
  }
};
