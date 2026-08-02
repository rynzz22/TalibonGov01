// Content Types
export interface ContentData {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  body?: any;
  [key: string]: any;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface Mayor {
  name: string;
  term: string;
}

export interface Department {
  id: string;
  name: string;
  officialName: string;
  description: string;
  type: string;
  head?: string;
  contact?: string;
  logoUrl?: string;
  serviceLink?: string;
}

export interface Service {
  name: string;
  description: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
}

export interface Form {
  id: string;
  title: string;
  url: string;
}

export interface InfrastructureProject {
  id: string;
  project_code?: string;
  title: string;
  category: 'road' | 'bridge' | 'school' | 'water' | 'hospital' | 'building' | 'coastal' | string;
  description?: string;
  status: 'planning' | 'procurement' | 'ongoing' | 'delayed' | 'completed' | 'cancelled';
  budget: number;
  funding_source?: string;
  contractor?: string;
  project_engineer?: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  progress_percentage: number;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmergencyAdvisory {
  id: string;
  title: string;
  type: 'weather' | 'flood' | 'road_closure' | 'power' | 'water' | 'health' | 'disaster' | 'emergency';
  severity: 'normal' | 'info' | 'watch' | 'warning' | 'emergency';
  content: string;
  affected_barangays?: string[];
  is_pinned?: boolean;
  is_popup?: boolean;
  banner_color?: string;
  status: 'draft' | 'published' | 'archived' | 'expired';
  start_date?: string;
  expiry_date?: string;
  created_by?: string;
  created_at?: string;
}

export interface LegislativeDocument {
  id: string;
  document_type: 'ordinance' | 'resolution' | 'executive_order' | 'memorandum';
  document_number: string;
  title: string;
  category?: string;
  summary?: string;
  full_text?: string;
  file_url?: string;
  publication_date?: string;
  effective_date?: string;
  status: 'draft' | 'published' | 'archived';
  views_count?: number;
  created_at?: string;
}

export interface TransparencyDocument {
  id: string;
  title: string;
  category: 'full_disclosure' | 'budget' | 'app' | 'bac_bids' | 'coa_report' | 'citizen_charter' | 'financial';
  fiscal_year: number;
  quarter?: string;
  department_id?: string;
  document_number?: string;
  file_url: string;
  file_size_bytes?: number;
  status: 'published' | 'archived';
  downloads_count?: number;
  created_at?: string;
}

export interface MediaAsset {
  id: string;
  folder_id?: string;
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
  file_hash?: string;
  usage_count?: number;
  created_at?: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PageBlock {
  id: string;
  page_id: string;
  block_type: 'hero' | 'rich_text' | 'gallery' | 'timeline' | 'stats' | 'faq' | 'accordion' | 'map' | 'downloads' | 'cards';
  content: Record<string, any>;
  block_order: number;
  is_enabled: boolean;
}

export interface HomepageWidget {
  id: string;
  widget_type: string;
  title?: string;
  subtitle?: string;
  config?: Record<string, any>;
  is_enabled: boolean;
  widget_order: number;
  start_date?: string;
  end_date?: string;
}

export interface FinanceReport {
  id: string;
  title: string;
  url: string;
}

export interface ExecutiveOrder {
  id: string;
  title: string;
  date: string;
}

export interface BudgetData {
  annualBudget: string;
  breakdown: Array<{
    category: string;
    amount: string;
  }>;
}

export interface Barangay {
  name: string;
  slug: string;
  captain: string;
}

export interface GADBeneficiary {
  id?: string;
  unique_id?: string;
  full_name: string;
  sex: 'Male' | 'Female' | 'Other';
  birthdate?: string;
  age?: number;
  barangay_id: string;
  civil_status?: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Common-law';
  sectoral_classification?: string[];
  contact_info?: string;
}
