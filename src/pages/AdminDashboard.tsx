import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import {
  cmsService,
  NewsItem,
  EmergencyAdvisoryItem,
  TourismSpotItem,
  EventItem,
  DepartmentItem,
  InfrastructureProjectItem,
  LegislativeDocumentItem,
  TransparencyDocumentItem,
  MediaAssetItem,
  UserProfileItem,
  ModulePermissionItem,
  AuditLogItem,
  isSupabaseConfigured
} from '../services/cmsService';
import {
  LayoutDashboard,
  Newspaper,
  AlertTriangle,
  Compass,
  Calendar,
  Building2,
  HardHat,
  Scroll,
  FolderKanban,
  Users,
  Shield,
  ListFilter,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Eye,
  ExternalLink,
  Upload,
  Folder,
  Download,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  LogOut,
  ShieldAlert,
  FileCheck,
  DollarSign,
  Briefcase
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  // Active Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'news'
    | 'advisories'
    | 'tourism'
    | 'events'
    | 'departments'
    | 'infra-projects'
    | 'ordinances'
    | 'transparency-docs'
    | 'media'
    | 'users'
    | 'permissions'
    | 'logs'
  >('overview');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sidebarFilter, setSidebarFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Collections State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [advisories, setAdvisories] = useState<EmergencyAdvisoryItem[]>([]);
  const [tourismSpots, setTourismSpots] = useState<TourismSpotItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [infrastructureProjects, setInfrastructureProjects] = useState<InfrastructureProjectItem[]>([]);
  const [ordinances, setOrdinances] = useState<LegislativeDocumentItem[]>([]);
  const [transparencyDocs, setTransparencyDocs] = useState<TransparencyDocumentItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfileItem[]>([]);
  const [permissionsList, setPermissionsList] = useState<ModulePermissionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Feedback and Modal states
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; tab: string; name: string } | null>(null);

  // Forms State
  const [newsForm, setNewsForm] = useState<Omit<NewsItem, 'id'>>({
    title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
    image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
    author: 'Municipal Admin', barangay_id: null
  });

  const [advisoryForm, setAdvisoryForm] = useState<Omit<EmergencyAdvisoryItem, 'id'>>({
    title: '', type: 'SAFETY', severity: 'warning', content: '',
    affected_barangays: [], is_pinned: false, is_popup: false, banner_color: 'amber',
    status: 'published', start_date: new Date().toISOString().split('T')[0], expiry_date: ''
  });

  const [tourismForm, setTourismForm] = useState<Omit<TourismSpotItem, 'id'>>({
    name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
    opening_hours: 'Always Open', contact_details: '', featured_image: ''
  });

  const [eventForm, setEventForm] = useState<Omit<EventItem, 'id'>>({
    title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00 AM', venue: '', banner_image: ''
  });

  const [departmentForm, setDepartmentForm] = useState<Omit<DepartmentItem, 'id'>>({
    name: '', description: '', head_of_office: '', contact_number: '', email: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
  });

  const [infraForm, setInfraForm] = useState<Omit<InfrastructureProjectItem, 'id'>>({
    project_code: `INFRA-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: '', category: 'Roads & Bridges', description: '', status: 'ongoing', budget: 1000000,
    funding_source: 'LGU General Fund', contractor: '', project_engineer: '', barangay: 'Poblacion',
    progress_percentage: 0, start_date: new Date().toISOString().split('T')[0], target_completion_date: ''
  });

  const [ordinanceForm, setOrdinanceForm] = useState<Omit<LegislativeDocumentItem, 'id'>>({
    document_type: 'ordinance', document_number: `Ord. No. 2026-${Math.floor(10 + Math.random() * 90)}`,
    title: '', category: 'General Governance', summary: '', full_text: '', file_url: '',
    publication_date: new Date().toISOString().split('T')[0], effective_date: new Date().toISOString().split('T')[0],
    status: 'published'
  });

  const [transparencyForm, setTransparencyForm] = useState<Omit<TransparencyDocumentItem, 'id'>>({
    title: '', description: '', category: 'Annual Investment Plan', department: 'Municipal Planning and Development Office',
    fiscal_year: 2026, quarter: 'Annual', file_url: '', file_size: '1.5 MB', status: 'published'
  });

  const [mediaForm, setMediaForm] = useState<Omit<MediaAssetItem, 'id'>>({
    filename: '', original_name: '', mime_type: 'image/jpeg', file_size: 512000,
    storage_path: '', public_url: '', alt_text: '', caption: ''
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, categoryFilter, statusFilter]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 6000);
  };

  // Central Database Fetcher
  const loadAllCmsData = useCallback(async () => {
    setIsTableLoading(true);
    try {
      const newsData = await cmsService.getNews();
      setNews(newsData || []);

      const advData = await cmsService.getEmergencyAdvisories();
      setAdvisories(advData || []);

      const spotsData = await cmsService.getTourismSpots();
      setTourismSpots(spotsData || []);

      const evData = await cmsService.getEvents();
      setEvents(evData || []);

      const deptsData = await cmsService.getDepartments();
      setDepartments(deptsData || []);

      const infraData = await cmsService.getInfrastructureProjects();
      setInfrastructureProjects(infraData || []);

      const legData = await cmsService.getLegislativeDocuments();
      setOrdinances(legData ? legData.filter(l => l.document_type === 'ordinance') : []);

      const transpData = await cmsService.getTransparencyDocuments();
      setTransparencyDocs(transpData || []);

      const mediaData = await cmsService.getMediaAssets();
      setMediaAssets(mediaData || []);

      const usersData = await cmsService.getUsers();
      setUsersList(usersData || []);

      const permData = await cmsService.getModulePermissions();
      setPermissionsList(permData || []);

      const logsData = await cmsService.getAuditLogs();
      setAuditLogs(logsData || []);
    } catch (err: any) {
      console.error("[AdminCMS] Fetch error:", err);
      showError("Error loading database records.");
    } finally {
      setIsTableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllCmsData();
  }, [loadAllCmsData]);

  // RESET FORMS
  const resetAllForms = () => {
    setEditingId(null);
    setNewsForm({
      title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
      image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
      author: 'Municipal Admin', barangay_id: null
    });
    setAdvisoryForm({
      title: '', type: 'SAFETY', severity: 'warning', content: '',
      affected_barangays: [], is_pinned: false, is_popup: false, banner_color: 'amber',
      status: 'published', start_date: new Date().toISOString().split('T')[0], expiry_date: ''
    });
    setTourismForm({
      name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
      opening_hours: 'Always Open', contact_details: '', featured_image: ''
    });
    setEventForm({
      title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00 AM', venue: '', banner_image: ''
    });
    setDepartmentForm({
      name: '', description: '', head_of_office: '', contact_number: '', email: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
    });
    setInfraForm({
      project_code: `INFRA-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: '', category: 'Roads & Bridges', description: '', status: 'ongoing', budget: 1000000,
      funding_source: 'LGU General Fund', contractor: '', project_engineer: '', barangay: 'Poblacion',
      progress_percentage: 0, start_date: new Date().toISOString().split('T')[0], target_completion_date: ''
    });
    setOrdinanceForm({
      document_type: 'ordinance', document_number: `Ord. No. 2026-${Math.floor(10 + Math.random() * 90)}`,
      title: '', category: 'General Governance', summary: '', full_text: '', file_url: '',
      publication_date: new Date().toISOString().split('T')[0], effective_date: new Date().toISOString().split('T')[0],
      status: 'published'
    });
    setTransparencyForm({
      title: '', description: '', category: 'Annual Investment Plan', department: 'Municipal Planning and Development Office',
      fiscal_year: 2026, quarter: 'Annual', file_url: '', file_size: '1.5 MB', status: 'published'
    });
    setMediaForm({
      filename: '', original_name: '', mime_type: 'image/jpeg', file_size: 512000,
      storage_path: '', public_url: '', alt_text: '', caption: ''
    });
  };

  // EDIT ENTITY POPULATOR
  const openEditEntity = (tab: typeof activeTab, item: any) => {
    resetAllForms();
    setEditingId(item.id);
    setIsModalOpen(true);

    if (tab === 'news') {
      setNewsForm({
        title: item.title, slug: item.slug, summary: item.summary, content: item.content,
        category: item.category, image_url: item.image_url || '', file_url: item.file_url || '',
        date: item.date, status: item.status || 'published', author: item.author || 'Municipal Admin',
        barangay_id: item.barangay_id || null
      });
    } else if (tab === 'advisories') {
      setAdvisoryForm({
        title: item.title, type: item.type || 'SAFETY', severity: item.severity || 'warning',
        content: item.content, affected_barangays: item.affected_barangays || [],
        is_pinned: item.is_pinned || false, is_popup: item.is_popup || false,
        banner_color: item.banner_color || 'amber', status: item.status || 'published',
        start_date: item.start_date || new Date().toISOString().split('T')[0], expiry_date: item.expiry_date || ''
      });
    } else if (tab === 'tourism') {
      setTourismForm({
        name: item.name, description: item.description, gallery_images: item.gallery_images || [],
        location: item.location, google_maps_link: item.google_maps_link || '',
        opening_hours: item.opening_hours || 'Always Open', contact_details: item.contact_details || '',
        featured_image: item.featured_image || ''
      });
    } else if (tab === 'events') {
      setEventForm({
        title: item.title, description: item.description, date: item.date,
        time: item.time || '09:00 AM', venue: item.venue, banner_image: item.banner_image || ''
      });
    } else if (tab === 'departments') {
      setDepartmentForm({
        name: item.name, description: item.description, head_of_office: item.head_of_office || '',
        contact_number: item.contact_number || '', email: item.email || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM', location: item.location || ''
      });
    } else if (tab === 'infra-projects') {
      setInfraForm({
        project_code: item.project_code, title: item.title, category: item.category || 'Roads & Bridges',
        description: item.description || '', status: item.status || 'ongoing', budget: item.budget || 0,
        funding_source: item.funding_source || '', contractor: item.contractor || '',
        project_engineer: item.project_engineer || '', barangay: item.barangay || 'Poblacion',
        progress_percentage: item.progress_percentage || 0, start_date: item.start_date || '',
        target_completion_date: item.target_completion_date || ''
      });
    } else if (tab === 'ordinances') {
      setOrdinanceForm({
        document_type: 'ordinance', document_number: item.document_number, title: item.title,
        category: item.category || 'General Governance', summary: item.summary || '',
        full_text: item.full_text || '', file_url: item.file_url || '',
        publication_date: item.publication_date || '', effective_date: item.effective_date || '',
        status: item.status || 'published'
      });
    } else if (tab === 'transparency-docs') {
      setTransparencyForm({
        title: item.title, description: item.description || '', category: item.category || 'Annual Investment Plan',
        department: item.department || '', fiscal_year: item.fiscal_year || 2026, quarter: item.quarter || 'Annual',
        file_url: item.file_url || '', file_size: item.file_size || '1.5 MB', status: item.status || 'published'
      });
    }
  };

  // DELETE HANDLER
  const handleDeleteEntity = async (tab: string, id: string) => {
    setIsActionLoading(true);
    const userEmail = user?.email || "admin@talibon.gov.ph";
    try {
      let success = false;
      if (tab === 'news') success = await cmsService.deleteNews(id, userEmail);
      else if (tab === 'advisories') success = await cmsService.deleteEmergencyAdvisory(id, userEmail);
      else if (tab === 'tourism') success = await cmsService.deleteTourismSpot(id, userEmail);
      else if (tab === 'events') success = await cmsService.deleteEvent(id, userEmail);
      else if (tab === 'departments') success = await cmsService.deleteDepartment(id, userEmail);
      else if (tab === 'infra-projects') success = await cmsService.deleteInfrastructureProject(id, userEmail);
      else if (tab === 'ordinances') success = await cmsService.deleteLegislativeDocument(id, userEmail);
      else if (tab === 'transparency-docs') success = await cmsService.deleteTransparencyDocument(id, userEmail);
      else if (tab === 'media') success = await cmsService.deleteMediaAsset(id, userEmail);

      if (success) {
        showSuccess("Record deleted successfully.");
        loadAllCmsData();
      } else {
        showError("Failed to delete record.");
      }
    } catch (err: any) {
      showError(err.message || "Delete failed.");
    } finally {
      setIsActionLoading(false);
      setDeleteConfirmItem(null);
    }
  };

  // SAVE HANDLER FOR ALL ENTITIES
  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    const userEmail = user?.email || "admin@talibon.gov.ph";

    try {
      if (activeTab === 'news') {
        const slug = newsForm.slug || newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = { ...newsForm, slug };
        if (editingId) {
          await cmsService.updateNews(editingId, payload, userEmail);
          showSuccess("News article updated!");
        } else {
          await cmsService.createNews(payload, userEmail);
          showSuccess("News article published!");
        }
      } else if (activeTab === 'advisories') {
        if (editingId) {
          await cmsService.updateEmergencyAdvisory(editingId, advisoryForm, userEmail);
          showSuccess("Emergency advisory updated!");
        } else {
          await cmsService.createEmergencyAdvisory(advisoryForm, userEmail);
          showSuccess("Emergency advisory issued!");
        }
      } else if (activeTab === 'tourism') {
        if (editingId) {
          await cmsService.updateTourismSpot(editingId, tourismForm, userEmail);
          showSuccess("Tourism spot updated!");
        } else {
          await cmsService.createTourismSpot(tourismForm, userEmail);
          showSuccess("Tourism spot registered!");
        }
      } else if (activeTab === 'events') {
        if (editingId) {
          await cmsService.updateEvent(editingId, eventForm, userEmail);
          showSuccess("Event details updated!");
        } else {
          await cmsService.createEvent(eventForm, userEmail);
          showSuccess("Event published!");
        }
      } else if (activeTab === 'departments') {
        if (editingId) {
          await cmsService.updateDepartment(editingId, departmentForm, userEmail);
          showSuccess("Department profile updated!");
        } else {
          await cmsService.createDepartment(departmentForm, userEmail);
          showSuccess("Department profile created!");
        }
      } else if (activeTab === 'infra-projects') {
        if (editingId) {
          await cmsService.updateInfrastructureProject(editingId, infraForm, userEmail);
          showSuccess("Infrastructure project updated!");
        } else {
          await cmsService.createInfrastructureProject(infraForm, userEmail);
          showSuccess("Infrastructure project created!");
        }
      } else if (activeTab === 'ordinances') {
        if (editingId) {
          await cmsService.updateLegislativeDocument(editingId, ordinanceForm, userEmail);
          showSuccess("Municipal Ordinance updated!");
        } else {
          await cmsService.createLegislativeDocument(ordinanceForm, userEmail);
          showSuccess("Municipal Ordinance enacted!");
        }
      } else if (activeTab === 'transparency-docs') {
        if (editingId) {
          await cmsService.updateTransparencyDocument(editingId, transparencyForm, userEmail);
          showSuccess("Transparency document updated!");
        } else {
          await cmsService.createTransparencyDocument(transparencyForm, userEmail);
          showSuccess("Transparency document published!");
        }
      } else if (activeTab === 'media') {
        const payload = {
          ...mediaForm,
          filename: mediaForm.filename || `asset_${Date.now()}.jpg`,
          original_name: mediaForm.original_name || mediaForm.filename || `asset_${Date.now()}.jpg`,
          public_url: mediaForm.public_url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
          storage_path: mediaForm.storage_path || `uploads/${Date.now()}.jpg`
        };
        await cmsService.createMediaAsset(payload, userEmail);
        showSuccess("Media file uploaded!");
      }

      setIsModalOpen(false);
      resetAllForms();
      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Failed to save changes.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // PERMISSION TOGGLE HANDLER
  const handleTogglePermission = async (permId: string, field: 'can_read' | 'can_create' | 'can_edit' | 'can_delete' | 'can_publish', val: boolean) => {
    const userEmail = user?.email || "admin@talibon.gov.ph";
    try {
      const updated = await cmsService.updateModulePermission(permId, { [field]: !val }, userEmail);
      setPermissionsList(prev => prev.map(p => p.id === permId ? updated : p));
      showSuccess("Module permission updated.");
    } catch (e) {
      showError("Failed to update permission.");
    }
  };

  // USER ACCESS ROLE UPDATER
  const handleUpdateUserRole = async (userId: string, targetRole: string, verified: boolean) => {
    const userEmail = user?.email || "admin@talibon.gov.ph";
    try {
      await cmsService.updateUserRole(userId, targetRole, verified, userEmail);
      showSuccess("User access role updated.");
      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Role update failed.");
    }
  };

  // SIDEBAR NAVIGATION MODULE DEFINITIONS
  const sidebarGroups = [
    {
      title: "Dashboard",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
      ]
    },
    {
      title: "Content",
      items: [
        { id: "news", label: "News & Bulletins", icon: Newspaper },
        { id: "advisories", label: "Emergency Advisories", icon: AlertTriangle },
        { id: "tourism", label: "Tourism Spots", icon: Compass },
        { id: "events", label: "Events Calendar", icon: Calendar },
      ]
    },
    {
      title: "Government",
      items: [
        { id: "departments", label: "Departments", icon: Building2 },
      ]
    },
    {
      title: "Infrastructure",
      items: [
        { id: "infra-projects", label: "Public Projects", icon: HardHat },
      ]
    },
    {
      title: "Legislation",
      items: [
        { id: "ordinances", label: "Ordinances", icon: Scroll },
      ]
    },
    {
      title: "Transparency",
      items: [
        { id: "transparency-docs", label: "Transparency Docs", icon: FileCheck },
      ]
    },
    {
      title: "Media",
      items: [
        { id: "media", label: "Media Library", icon: FolderKanban },
      ]
    },
    {
      title: "Administration",
      items: [
        { id: "users", label: "User Accounts", icon: Users },
        { id: "permissions", label: "RBAC Matrix", icon: Shield },
        { id: "logs", label: "Audit Logs", icon: ListFilter },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900 antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shrink-0 sticky top-0 h-screen z-20`}>
        {/* LGU BRAND HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                LGU
              </div>
              <div>
                <h1 className="font-black text-sm uppercase tracking-tight text-gray-900">Talibon Core</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enterprise CMS V3</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* SIDEBAR FILTER */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-300" size={14} />
              <input
                type="text"
                placeholder="Filter modules..."
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 rounded-xl text-xs font-bold border border-transparent focus:border-blue-200 focus:bg-white outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        )}

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarGroups.map((group) => {
            const filteredItems = group.items.filter(item =>
              !sidebarFilter || item.label.toLowerCase().includes(sidebarFilter.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] pl-3 mb-1">
                    {group.title}
                  </p>
                ) : (
                  <div className="border-t border-gray-100 my-2" />
                )}
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* USER LOGGED IN PROFILE */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="truncate pr-2">
                <p className="text-xs font-black text-gray-900 truncate">{profile?.full_name || user?.email}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{profile?.role || 'Administrator'}</p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto space-y-8">
        {/* NOTIFICATION & FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg"><X size={14} /></button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-green-100 rounded-lg"><X size={14} /></button>
          </div>
        )}

        {/* OVERVIEW / DASHBOARD PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Status Overview</h2>
              <p className="text-gray-400 font-bold text-xs mt-1">Live Database Metrics for LGU Talibon Municipal Operating System.</p>
            </div>

            {/* REAL DATABASE STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Newspaper size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{news.filter(n => n.status === 'published').length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published News</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{advisories.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Advisories</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{tourismSpots.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tourism Spots</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HardHat size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{infrastructureProjects.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Projects</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Scroll size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{ordinances.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enacted Ordinances</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{transparencyDocs.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transparency Files</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                  <FolderKanban size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{mediaAssets.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Assets</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900">{usersList.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Accounts</p>
              </div>
            </div>

            {/* DB CONNECTIVITY CARD */}
            <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">PostgreSQL Backend Connection</h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">
                  {isSupabaseConfigured
                    ? "Live Supabase Database Connected. Real-time changes synchronized with public municipal portal."
                    : "Browser Storage Fallback active. Connect SUPABASE_URL & SUPABASE_ANON_KEY to stream live data."}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isSupabaseConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {isSupabaseConfigured ? 'Live Database' : 'Offline Mode'}
              </span>
            </div>

            {/* RECENT ACTIVITY & MEDIA UPLOADS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RECENT LOGS */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Recent Audit Logs</h3>
                <div className="divide-y divide-gray-50">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{log.user_email}</p>
                        <p className="text-[10px] text-gray-400"><span className="font-black text-blue-600">{log.action}</span> on {log.target_table}</p>
                      </div>
                      <span className="text-[10px] text-gray-300 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">No audit logs recorded yet.</p>}
                </div>
              </div>

              {/* RECENT UPLOADS */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Recent Media Uploads</h3>
                <div className="grid grid-cols-3 gap-3">
                  {mediaAssets.slice(0, 6).map(media => (
                    <div key={media.id} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
                      <img src={media.public_url} alt={media.alt_text || media.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                        <p className="text-[9px] text-white font-bold truncate">{media.original_name}</p>
                      </div>
                    </div>
                  ))}
                  {mediaAssets.length === 0 && <p className="col-span-3 text-xs text-gray-400 py-8 text-center">No media files uploaded yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GENERIC SEARCH & ADD TOOLBAR FOR ACTIVE TABLE TAB */}
        {activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'permissions' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 text-gray-300" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <button
              onClick={() => { resetAllForms(); setIsModalOpen(true); }}
              className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Add New Record
            </button>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">News & Bulletins ({news.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {news
                .filter(n => !searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(item => (
                  <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{item.category}</span>
                        <span className="text-[10px] text-gray-300 font-mono">• {item.date}</span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{item.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setViewingItem(item)} className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors cursor-pointer"><Eye size={16} /></button>
                      <button onClick={() => openEditEntity('news', item)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'news', name: item.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              {news.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No news records found.</p>}
            </div>
          </div>
        )}

        {/* EMERGENCY ADVISORIES TAB */}
        {activeTab === 'advisories' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Emergency Advisories ({advisories.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {advisories
                .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(adv => (
                  <div key={adv.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                          adv.severity === 'critical' || adv.severity === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {adv.severity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{adv.type}</span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900">{adv.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{adv.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditEntity('advisories', adv)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: adv.id, tab: 'advisories', name: adv.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              {advisories.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No advisories posted.</p>}
            </div>
          </div>
        )}

        {/* TOURISM SPOTS TAB */}
        {activeTab === 'tourism' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourismSpots
              .filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(spot => (
                <div key={spot.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img src={spot.featured_image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600'} alt={spot.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-black text-sm text-gray-900">{spot.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{spot.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MapPin size={12} /> {spot.location}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditEntity('tourism', spot)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"><Edit size={14} /></button>
                        <button onClick={() => setDeleteConfirmItem({ id: spot.id, tab: 'tourism', name: spot.name })} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {tourismSpots.length === 0 && <div className="col-span-full bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-400 font-bold">No tourism spots registered.</div>}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Events Calendar ({events.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {events
                .filter(e => !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(ev => (
                  <div key={ev.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                        <Calendar size={14} /> <span>{ev.date} @ {ev.time}</span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900">{ev.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {ev.venue}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditEntity('events', ev)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: ev.id, tab: 'events', name: ev.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              {events.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No municipal events scheduled.</p>}
            </div>
          </div>
        )}

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments
              .filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(dept => (
                <div key={dept.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{dept.name}</h4>
                      <p className="text-xs font-bold text-blue-600 mt-0.5">Head: {dept.head_of_office || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditEntity('departments', dept)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"><Edit size={14} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: dept.id, tab: 'departments', name: dept.name })} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{dept.description}</p>
                  <div className="pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold space-y-1">
                    <p className="flex items-center gap-1"><Phone size={12} /> {dept.contact_number || 'N/A'}</p>
                    <p className="flex items-center gap-1"><Mail size={12} /> {dept.email || 'N/A'}</p>
                  </div>
                </div>
              ))}
            {departments.length === 0 && <div className="col-span-full bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-400 font-bold">No departments registered.</div>}
          </div>
        )}

        {/* INFRASTRUCTURE PROJECTS TAB */}
        {activeTab === 'infra-projects' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Infrastructure Projects ({infrastructureProjects.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {infrastructureProjects
                .filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(proj => (
                  <div key={proj.id} className="p-6 space-y-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md">{proj.project_code}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{proj.category}</span>
                        </div>
                        <h4 className="font-black text-sm text-gray-900 mt-1">{proj.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditEntity('infra-projects', proj)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                        <button onClick={() => setDeleteConfirmItem({ id: proj.id, tab: 'infra-projects', name: proj.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {/* PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Progress ({proj.progress_percentage}%)</span>
                        <span>Budget: ₱{proj.budget?.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${proj.progress_percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              {infrastructureProjects.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No infrastructure projects logged.</p>}
            </div>
          </div>
        )}

        {/* ORDINANCES TAB */}
        {activeTab === 'ordinances' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Enacted Municipal Ordinances ({ordinances.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {ordinances
                .filter(o => !searchTerm || o.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(ord => (
                  <div key={ord.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-black text-[9px] uppercase rounded">{ord.document_number}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{ord.category}</span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900">{ord.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{ord.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ord.file_url && (
                        <a href={ord.file_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors"><Download size={16} /></a>
                      )}
                      <button onClick={() => openEditEntity('ordinances', ord)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: ord.id, tab: 'ordinances', name: ord.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              {ordinances.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No ordinances registered.</p>}
            </div>
          </div>
        )}

        {/* TRANSPARENCY DOCUMENTS TAB */}
        {activeTab === 'transparency-docs' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Transparency Documents Archive ({transparencyDocs.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {transparencyDocs
                .filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(doc => (
                  <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-black text-[9px] uppercase rounded">FY {doc.fiscal_year}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{doc.category}</span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900">{doc.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors"><Download size={16} /></a>
                      )}
                      <button onClick={() => openEditEntity('transparency-docs', doc)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                      <button onClick={() => setDeleteConfirmItem({ id: doc.id, tab: 'transparency-docs', name: doc.title })} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              {transparencyDocs.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No transparency files archived.</p>}
            </div>
          </div>
        )}

        {/* MEDIA LIBRARY TAB */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mediaAssets
              .filter(m => !searchTerm || m.original_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(media => (
                <div key={media.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs space-y-3 p-3">
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                    <img src={media.public_url} alt={media.alt_text || media.filename} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{media.original_name}</p>
                    <button onClick={() => setDeleteConfirmItem({ id: media.id, tab: 'media', name: media.original_name })} className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            {mediaAssets.length === 0 && <div className="col-span-full bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-400 font-bold">No media assets in library.</div>}
          </div>
        )}

        {/* USERS ACCOUNTS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">User Staff Accounts ({usersList.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {usersList
                .filter(u => !searchTerm || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(usr => (
                  <div key={usr.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{usr.full_name || 'Staff User'}</h4>
                      <p className="text-xs text-gray-500 font-mono">{usr.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={usr.role}
                        onChange={(e) => handleUpdateUserRole(usr.id, e.target.value, usr.is_verified)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="municipal_admin">Municipal Admin</option>
                        <option value="barangay_admin">Barangay Admin</option>
                      </select>

                      <button
                        onClick={() => handleUpdateUserRole(usr.id, usr.role, !usr.is_verified)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                          usr.is_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {usr.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* PERMISSIONS MATRIX TAB */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">RBAC Permissions Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4 text-center">Read</th>
                    <th className="py-3 px-4 text-center">Create</th>
                    <th className="py-3 px-4 text-center">Edit</th>
                    <th className="py-3 px-4 text-center">Delete</th>
                    <th className="py-3 px-4 text-center">Publish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {permissionsList.map(perm => (
                    <tr key={perm.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-black uppercase text-blue-600">{perm.role}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{perm.module}</td>
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" checked={perm.can_read} onChange={() => handleTogglePermission(perm.id, 'can_read', perm.can_read)} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" checked={perm.can_create} onChange={() => handleTogglePermission(perm.id, 'can_create', perm.can_create)} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" checked={perm.can_edit} onChange={() => handleTogglePermission(perm.id, 'can_edit', perm.can_edit)} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" checked={perm.can_delete} onChange={() => handleTogglePermission(perm.id, 'can_delete', perm.can_delete)} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" checked={perm.can_publish} onChange={() => handleTogglePermission(perm.id, 'can_publish', perm.can_publish)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">Audit Logs Trail ({auditLogs.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{log.user_email}</p>
                    <p className="text-[10px] text-gray-400"><span className="font-black text-blue-600">{log.action}</span> on table <span className="font-mono text-gray-600">{log.target_table}</span> (ID: {log.target_id})</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="p-8 text-center text-xs text-gray-400 font-bold">No audit trail records found.</p>}
            </div>
          </div>
        )}
      </main>

      {/* MODAL FORM FOR CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-black text-base uppercase tracking-tight text-gray-900">
                {editingId ? 'Edit Record' : 'Create New Record'} - {activeTab}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEntity} className="space-y-4">
              {/* NEWS FORM FIELDS */}
              {activeTab === 'news' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Title</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Summary</label>
                    <textarea
                      required
                      rows={2}
                      value={newsForm.summary}
                      onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Full Content</label>
                    <textarea
                      required
                      rows={4}
                      value={newsForm.content}
                      onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* EMERGENCY ADVISORY FORM FIELDS */}
              {activeTab === 'advisories' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Title</label>
                    <input
                      type="text"
                      required
                      value={advisoryForm.title}
                      onChange={e => setAdvisoryForm({ ...advisoryForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Severity</label>
                    <select
                      value={advisoryForm.severity}
                      onChange={e => setAdvisoryForm({ ...advisoryForm, severity: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                      <option value="danger">Danger</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Advisory Details</label>
                    <textarea
                      required
                      rows={3}
                      value={advisoryForm.content}
                      onChange={e => setAdvisoryForm({ ...advisoryForm, content: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* TOURISM FORM FIELDS */}
              {activeTab === 'tourism' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Spot Name</label>
                    <input
                      type="text"
                      required
                      value={tourismForm.name}
                      onChange={e => setTourismForm({ ...tourismForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Location</label>
                    <input
                      type="text"
                      required
                      value={tourismForm.location}
                      onChange={e => setTourismForm({ ...tourismForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={tourismForm.description}
                      onChange={e => setTourismForm({ ...tourismForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* EVENTS FORM FIELDS */}
              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Event Title</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Venue</label>
                    <input
                      type="text"
                      required
                      value={eventForm.venue}
                      onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={eventForm.description}
                      onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* DEPARTMENTS FORM FIELDS */}
              {activeTab === 'departments' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Department Name</label>
                    <input
                      type="text"
                      required
                      value={departmentForm.name}
                      onChange={e => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={departmentForm.description}
                      onChange={e => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* INFRASTRUCTURE FORM FIELDS */}
              {activeTab === 'infra-projects' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Project Title</label>
                    <input
                      type="text"
                      required
                      value={infraForm.title}
                      onChange={e => setInfraForm({ ...infraForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Progress Percentage (0-100%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={infraForm.progress_percentage}
                      onChange={e => setInfraForm({ ...infraForm, progress_percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={infraForm.description}
                      onChange={e => setInfraForm({ ...infraForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* ORDINANCE FORM FIELDS */}
              {activeTab === 'ordinances' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Ordinance Number</label>
                    <input
                      type="text"
                      required
                      value={ordinanceForm.document_number}
                      onChange={e => setOrdinanceForm({ ...ordinanceForm, document_number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Title</label>
                    <input
                      type="text"
                      required
                      value={ordinanceForm.title}
                      onChange={e => setOrdinanceForm({ ...ordinanceForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Summary</label>
                    <textarea
                      required
                      rows={3}
                      value={ordinanceForm.summary}
                      onChange={e => setOrdinanceForm({ ...ordinanceForm, summary: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* TRANSPARENCY DOCS FORM FIELDS */}
              {activeTab === 'transparency-docs' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Document Title</label>
                    <input
                      type="text"
                      required
                      value={transparencyForm.title}
                      onChange={e => setTransparencyForm({ ...transparencyForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={transparencyForm.description}
                      onChange={e => setTransparencyForm({ ...transparencyForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* MEDIA FORM FIELDS */}
              {activeTab === 'media' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">File Name</label>
                    <input
                      type="text"
                      required
                      value={mediaForm.original_name}
                      onChange={e => setMediaForm({ ...mediaForm, original_name: e.target.value, filename: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Image / File URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={mediaForm.public_url}
                      onChange={e => setMediaForm({ ...mediaForm, public_url: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isActionLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-base uppercase tracking-tight text-gray-900">Confirm Deletion</h3>
            <p className="text-xs font-bold text-gray-500">
              Are you sure you want to delete <span className="text-gray-900 font-black">"{deleteConfirmItem.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntity(deleteConfirmItem.tab, deleteConfirmItem.id)}
                disabled={isActionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-red-500/20 cursor-pointer"
              >
                {isActionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWING ITEM MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-900">{viewingItem.title || viewingItem.name}</h3>
              <button onClick={() => setViewingItem(null)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <p><strong className="text-gray-900">Category:</strong> {viewingItem.category}</p>
              <p><strong className="text-gray-900">Status:</strong> {viewingItem.status}</p>
              <p className="pt-2 text-gray-800 leading-relaxed">{viewingItem.content || viewingItem.description || viewingItem.summary}</p>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewingItem(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
