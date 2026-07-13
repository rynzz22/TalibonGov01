import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn, LogOut, Trash2, FileText, CheckCircle,
  AlertCircle, ShieldCheck, Plus, X, Search,
  Newspaper, Users, Gavel, LayoutDashboard,
  Edit3, Save, Globe, Building2, Mic, Eye,
  Folder, Image, Clock, Landmark, Calendar,
  Shield, Activity, RefreshCw, HelpCircle, Key, ListCollapse
} from 'lucide-react';
import MeetingAssistant from '../components/MeetingAssistant';
import FileUpload from '../components/FileUpload';
import { BARANGAYS } from '../constants/barangayConfig';
import {
  cmsService,
  NewsItem,
  DownloadableItem,
  TourismSpotItem,
  OfficialItem,
  DepartmentItem,
  ServiceCmsItem,
  CitizensCharterCmsItem,
  EventItem,
  AuditLogItem,
  UserProfileItem
} from '../services/cmsService';

const AdminDashboard: React.FC = () => {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'news'
    | 'downloadables'
    | 'tourism'
    | 'officials'
    | 'departments'
    | 'services'
    | 'charter'
    | 'events'
    | 'media'
    | 'users'
    | 'logs'
    | 'meeting-assistant'
  >('overview');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalNews: 0,
    totalDownloadables: 0,
    totalTourism: 0,
    totalOfficials: 0,
    totalDepartments: 0,
    totalServices: 0,
    totalEvents: 0
  });

  // Database lists
  const [news, setNews] = useState<NewsItem[]>([]);
  const [downloadables, setDownloadables] = useState<DownloadableItem[]>([]);
  const [tourismSpots, setTourismSpots] = useState<TourismSpotItem[]>([]);
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [services, setServices] = useState<ServiceCmsItem[]>([]);
  const [charters, setCharters] = useState<CitizensCharterCmsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfileItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Media Library Files State
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  // Form states
  const [newsForm, setNewsForm] = useState<Omit<NewsItem, 'id'>>({
    title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
    image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
    author: 'Municipal Admin'
  });

  const [downloadForm, setDownloadForm] = useState<Omit<DownloadableItem, 'id'>>({
    title: '', description: '', category: 'forms', file_url: '', file_size: '1.2 MB', status: 'published'
  });

  const [tourismForm, setTourismForm] = useState<Omit<TourismSpotItem, 'id'>>({
    name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
    opening_hours: 'Always Open', contact_details: '', featured_image: ''
  });

  const [officialForm, setOfficialForm] = useState<Omit<OfficialItem, 'id'>>({
    name: '', role: '', level: 3, display_order: 0, image_url: '', biography: '',
    contact_info: '', department: ''
  });

  const [departmentForm, setDepartmentForm] = useState<Omit<DepartmentItem, 'id'>>({
    name: '', description: '', head_of_office: '', contact_number: '', email: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
  });

  const [serviceForm, setServiceForm] = useState<Omit<ServiceCmsItem, 'id'>>({
    name: '', slug: '', description: '', purpose: '', requirements: [],
    processing_time: '3 to 5 business days', fees: 'None', office_responsible: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', contact_info: '',
    physical_address: '', status: 'available', downloadable_forms: []
  });

  const [charterForm, setCharterForm] = useState<Omit<CitizensCharterCmsItem, 'id'>>({
    office: '', service_name: '', requirements: [], processing_time: '',
    fees: 'No Fees', steps: [], downloadable_forms: []
  });

  const [eventForm, setEventForm] = useState<Omit<EventItem, 'id'>>({
    title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', venue: '', banner_image: ''
  });

  // Dynamic Array Fields Input States (Temporary holder)
  const [tempReqInput, setTempReqInput] = useState('');
  const [tempFormTitle, setTempFormTitle] = useState('');
  const [tempFormUrl, setTempFormUrl] = useState('');
  const [tempFormSize, setTempFormSize] = useState('1.0 MB');

  const [tempStepNum, setTempStepNum] = useState(1);
  const [tempStepActivity, setTempStepActivity] = useState('');
  const [tempStepOffice, setTempStepOffice] = useState('');
  const [tempStepDuration, setTempStepDuration] = useState('');
  const [tempStepClient, setTempStepClient] = useState('');

  // Access constraints
  const canAccessManagement =
    profile && profile.is_verified &&
    ['super_admin', 'admin', 'editor', 'municipal_admin', 'barangay_admin'].includes(profile.role);

  const isSuperAdminOrAdmin =
    profile && ['super_admin', 'admin', 'municipal_admin'].includes(profile.role);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 6000);
  };

  // Central fetcher
  const loadAllCmsData = useCallback(async () => {
    if (!canAccessManagement) return;
    setIsActionLoading(true);
    try {
      // 1. Dashboard statistics
      const statsData = await cmsService.getDashboardStats();
      setStats(statsData);

      // 2. Tab-specific data fetches
      const newsData = await cmsService.getNews();
      setNews(newsData);

      const downloadData = await cmsService.getDownloadables();
      setDownloadables(downloadData);

      const spotsData = await cmsService.getTourismSpots();
      setTourismSpots(spotsData);

      const officialsData = await cmsService.getOfficials();
      setOfficials(officialsData);

      const deptsData = await cmsService.getDepartments();
      setDepartments(deptsData);

      const srvData = await cmsService.getServices();
      setServices(srvData);

      const ccData = await cmsService.getCitizensCharter();
      setCharters(ccData);

      const evData = await cmsService.getEvents();
      setEvents(evData);

      const logsData = await cmsService.getAuditLogs();
      setAuditLogs(logsData);

      if (isSuperAdminOrAdmin) {
        const usersData = await cmsService.getUsers();
        setUsersList(usersData);
      }
    } catch (err: any) {
      console.error("[AdminCMS] Fetch error:", err);
      showError("Error loading CMS data. Please make sure database is initialized.");
    } finally {
      setIsActionLoading(false);
    }
  }, [canAccessManagement, profile?.role]);

  // Media Library Fetcher
  const fetchMediaFiles = async () => {
    if (!isSupabaseConfigured) {
      setMediaFiles([
        { name: "sample_permit_form.pdf", id: "pdf-1", updated_at: new Date().toISOString(), size: 1400000, metadata: { mimetype: "application/pdf" } },
        { name: "tourism_spot_danajon.jpg", id: "img-1", updated_at: new Date().toISOString(), size: 850000, metadata: { mimetype: "image/jpeg" } }
      ]);
      return;
    }
    setMediaLoading(true);
    try {
      const { data, error } = await supabase.storage.from('public-assets').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });
      if (error) throw error;
      if (data) {
        setMediaFiles(data);
      }
    } catch (err: any) {
      console.error("[Media Library] Fetch error:", err.message);
      showError("Could not retrieve media files: " + err.message);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    loadAllCmsData();
  }, [loadAllCmsData]);

  useEffect(() => {
    if (activeTab === 'media') {
      fetchMediaFiles();
    }
  }, [activeTab]);

  // RESET FORMS
  const resetAllForms = () => {
    setEditingId(null);
    setNewsForm({
      title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
      image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
      author: 'Municipal Admin'
    });
    setDownloadForm({
      title: '', description: '', category: 'forms', file_url: '', file_size: '1.2 MB', status: 'published'
    });
    setTourismForm({
      name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
      opening_hours: 'Always Open', contact_details: '', featured_image: ''
    });
    setOfficialForm({
      name: '', role: '', level: 3, display_order: 0, image_url: '', biography: '',
      contact_info: '', department: ''
    });
    setDepartmentForm({
      name: '', description: '', head_of_office: '', contact_number: '', email: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
    });
    setServiceForm({
      name: '', slug: '', description: '', purpose: '', requirements: [],
      processing_time: '3 to 5 business days', fees: 'None', office_responsible: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', contact_info: '',
      physical_address: '', status: 'available', downloadable_forms: []
    });
    setCharterForm({
      office: '', service_name: '', requirements: [], processing_time: '',
      fees: 'No Fees', steps: [], downloadable_forms: []
    });
    setEventForm({
      title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', venue: '', banner_image: ''
    });

    // Reset arrays
    setTempReqInput('');
    setTempFormTitle('');
    setTempFormUrl('');
    setTempStepActivity('');
    setTempStepOffice('');
    setTempStepDuration('');
    setTempStepClient('');
  };

  // OPEN EDIT FOR ENTITIES
  const openEditEntity = (tab: typeof activeTab, item: any) => {
    resetAllForms();
    setEditingId(item.id);
    setIsModalOpen(true);

    if (tab === 'news') {
      setNewsForm({
        title: item.title, slug: item.slug, summary: item.summary, content: item.content,
        category: item.category, image_url: item.image_url || '', file_url: item.file_url || '',
        date: item.date, status: item.status || 'published', author: item.author || 'Municipal Admin'
      });
    } else if (tab === 'downloadables') {
      setDownloadForm({
        title: item.title, description: item.description, category: item.category,
        file_url: item.file_url, file_size: item.file_size || '1.2 MB', status: item.status || 'published'
      });
    } else if (tab === 'tourism') {
      setTourismForm({
        name: item.name, description: item.description, gallery_images: item.gallery_images || [],
        location: item.location, google_maps_link: item.google_maps_link || '',
        opening_hours: item.opening_hours || 'Always Open', contact_details: item.contact_details || '',
        featured_image: item.featured_image || ''
      });
    } else if (tab === 'officials') {
      setOfficialForm({
        name: item.name, role: item.role, level: item.level || 3, display_order: item.display_order || 0,
        image_url: item.image_url || '', biography: item.biography || '',
        contact_info: item.contact_info || '', department: item.department || ''
      });
    } else if (tab === 'departments') {
      setDepartmentForm({
        name: item.name, description: item.description, head_of_office: item.head_of_office || '',
        contact_number: item.contact_number || '', email: item.email || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM', location: item.location || ''
      });
    } else if (tab === 'services') {
      setServiceForm({
        name: item.name, slug: item.slug, description: item.description, purpose: item.purpose || '',
        requirements: item.requirements || [], processing_time: item.processing_time || '3 to 5 business days',
        fees: item.fees || 'None', office_responsible: item.office_responsible || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM',
        contact_info: item.contact_info || '', physical_address: item.physical_address || '',
        status: item.status || 'available', downloadable_forms: item.downloadable_forms || []
      });
    } else if (tab === 'charter') {
      setCharterForm({
        office: item.office, service_name: item.service_name, requirements: item.requirements || [],
        processing_time: item.processing_time || '', fees: item.fees || 'No Fees',
        steps: item.steps || [], downloadable_forms: item.downloadable_forms || []
      });
    } else if (tab === 'events') {
      setEventForm({
        title: item.title, description: item.description, date: item.date,
        time: item.time, venue: item.venue, banner_image: item.banner_image || ''
      });
    }
  };

  // DELETE ENTITY
  const handleDeleteEntity = async (tab: typeof activeTab, id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;
    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      let success = false;
      if (tab === 'news') success = await cmsService.deleteNews(id, userEmail);
      else if (tab === 'downloadables') success = await cmsService.deleteDownloadable(id, userEmail);
      else if (tab === 'tourism') success = await cmsService.deleteTourismSpot(id, userEmail);
      else if (tab === 'officials') success = await cmsService.deleteOfficial(id, userEmail);
      else if (tab === 'departments') success = await cmsService.deleteDepartment(id, userEmail);
      else if (tab === 'services') success = await cmsService.deleteService(id, userEmail);
      else if (tab === 'charter') success = await cmsService.deleteCitizensCharter(id, userEmail);
      else if (tab === 'events') success = await cmsService.deleteEvent(id, userEmail);

      if (success) {
        showSuccess("Item deleted successfully.");
        loadAllCmsData();
      } else {
        showError("Failed to delete item.");
      }
    } catch (err: any) {
      showError(err.message || "Delete error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // SAVE SUBMISSION FOR ALL ENTITIES
  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      if (activeTab === 'news') {
        const slug = newsForm.slug || newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = { ...newsForm, slug };
        if (editingId) {
          await cmsService.updateNews(editingId, payload, userEmail);
          showSuccess("News article updated!");
        } else {
          await cmsService.createNews(payload, userEmail);
          showSuccess("News published successfully!");
        }
      } else if (activeTab === 'downloadables') {
        if (editingId) {
          await cmsService.updateDownloadable(editingId, downloadForm, userEmail);
          showSuccess("Downloadable asset updated!");
        } else {
          await cmsService.createDownloadable(downloadForm, userEmail);
          showSuccess("Downloadable asset published!");
        }
      } else if (activeTab === 'tourism') {
        if (editingId) {
          await cmsService.updateTourismSpot(editingId, tourismForm, userEmail);
          showSuccess("Tourism spot details updated!");
        } else {
          await cmsService.createTourismSpot(tourismForm, userEmail);
          showSuccess("New tourism spot registered!");
        }
      } else if (activeTab === 'officials') {
        if (editingId) {
          await cmsService.updateOfficial(editingId, officialForm, userEmail);
          showSuccess("Official record updated!");
        } else {
          await cmsService.createOfficial(officialForm, userEmail);
          showSuccess("Official added to directories!");
        }
      } else if (activeTab === 'departments') {
        if (editingId) {
          await cmsService.updateDepartment(editingId, departmentForm, userEmail);
          showSuccess("Department files updated!");
        } else {
          await cmsService.createDepartment(departmentForm, userEmail);
          showSuccess("New municipal department created!");
        }
      } else if (activeTab === 'services') {
        const slug = serviceForm.slug || serviceForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = { ...serviceForm, slug };
        if (editingId) {
          await cmsService.updateService(editingId, payload, userEmail);
          showSuccess("Service updated successfully!");
        } else {
          await cmsService.createService(payload, userEmail);
          showSuccess("Service registered successfully!");
        }
      } else if (activeTab === 'charter') {
        if (editingId) {
          await cmsService.updateCitizensCharter(editingId, charterForm, userEmail);
          showSuccess("Citizens Charter entry updated!");
        } else {
          await cmsService.createCitizensCharter(charterForm, userEmail);
          showSuccess("Citizens Charter registered!");
        }
      } else if (activeTab === 'events') {
        if (editingId) {
          await cmsService.updateEvent(editingId, eventForm, userEmail);
          showSuccess("Event record modified!");
        } else {
          await cmsService.createEvent(eventForm, userEmail);
          showSuccess("Event published successfully!");
        }
      }

      setIsModalOpen(false);
      resetAllForms();
      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Failed to save details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // USER ACCESS VERIFICATION & ROLE SETTINGS
  const handleUpdateUserRole = async (userId: string, targetRole: string, verified: boolean) => {
    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      await cmsService.updateUserRole(userId, targetRole, verified, userEmail);
      showSuccess("User permissions and verification status updated!");
      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Permissions change error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // DELETE FILE FROM SUPABASE STORAGE
  const handleDeleteMedia = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    if (!isSupabaseConfigured) {
      showSuccess("Mock media deleted.");
      return;
    }
    try {
      const { error } = await supabase.storage.from('public-assets').remove([name]);
      if (error) throw error;
      showSuccess("Media asset removed.");
      fetchMediaFiles();
    } catch (err: any) {
      showError("Delete error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderSpin />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Initializing CMS Security...</p>
        </div>
      </div>
    );
  }

  // Not Logged In or Unauthorized View
  if (!user || !canAccessManagement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Admin Access Portal</h1>
          <p className="text-gray-500 font-medium mb-12 leading-relaxed">
            This area is strictly restricted to verified municipal administrators, department heads, and content editors.
          </p>

          {user && !profile && (
            <div className="mb-8 p-4 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2">
              <AlertCircle size={16} />
              Profile registration required — please complete setup at /login
            </div>
          )}

          {profile && !profile.is_verified && (
            <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-2">
              <AlertCircle size={16} />
              Your account is pending administrator verification
            </div>
          )}

          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
            >
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
              Sign In with Google
            </button>
          ) : (
            <button
              onClick={signOut}
              className="w-full py-5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 md:pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
                  CMS Administration
                </h1>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Local Government of Talibon, Bohol</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-gray-400 font-bold text-xs tracking-wider">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs">Logged:</span>
              <span className="text-blue-600 font-black">{user.email}</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] uppercase font-black tracking-widest">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'users' && activeTab !== 'media' && activeTab !== 'meeting-assistant' && (
              <button
                onClick={() => { resetAllForms(); setIsModalOpen(true); }}
                className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 grow lg:grow-0"
              >
                <Plus size={16} />
                Create New
              </button>
            )}
            <button
              onClick={loadAllCmsData}
              disabled={isActionLoading}
              className="px-5 py-4 bg-white text-gray-600 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-100 border border-gray-100 transition-all flex items-center justify-center gap-2 grow lg:grow-0"
            >
              <RefreshCw size={16} className={isActionLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={signOut}
              className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 grow lg:grow-0"
            >
              <LogOut size={16} />
              Exit CMS
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* MAIN CMS LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* NAVIGATION SIDEBAR */}
          <div className="space-y-2 lg:col-span-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4 mb-3">Core Modules</p>
            <SidebarBtn id="overview" label="Dashboard Stats" icon={LayoutDashboard} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="news" label="News & Advisory" icon={Newspaper} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="downloadables" label="Document Library" icon={Folder} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="tourism" label="Tourism Spots" icon={Image} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="events" label="Public Events" icon={Calendar} active={activeTab} onClick={setActiveTab} />
            
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4 mt-6 mb-3">Municipality Structure</p>
            <SidebarBtn id="officials" label="Officials Directory" icon={Users} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="departments" label="Departments" icon={Landmark} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="services" label="Municipal Services" icon={Building2} active={activeTab} onClick={setActiveTab} />
            <SidebarBtn id="charter" label="Citizen's Charter" icon={Gavel} active={activeTab} onClick={setActiveTab} />

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4 mt-6 mb-3">Utilities & Control</p>
            <SidebarBtn id="media" label="Media Library" icon={Image} active={activeTab} onClick={setActiveTab} />
            {isSuperAdminOrAdmin && (
              <>
                <SidebarBtn id="users" label="User Permissions" icon={Key} active={activeTab} onClick={setActiveTab} />
                <SidebarBtn id="logs" label="Administrative Logs" icon={Activity} active={activeTab} onClick={setActiveTab} />
              </>
            )}
            <SidebarBtn id="meeting-assistant" label="AI Meeting Scribe" icon={Mic} active={activeTab} onClick={setActiveTab} />
          </div>

          {/* MAIN DATA PANELS */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[60vh] p-8 md:p-12">
              
              {/* PANEL SEARCH BOX FOR FILTERING CODES */}
              {activeTab !== 'overview' && activeTab !== 'media' && activeTab !== 'meeting-assistant' && activeTab !== 'logs' && (
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search managed entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">CMS Status Overview</h2>
                    <p className="text-gray-400 font-bold text-xs">Real-time counts of municipal web elements managed by this account.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatBox count={stats.totalNews} label="News Posts" icon={Newspaper} color="bg-blue-50 text-blue-600" />
                    <StatBox count={stats.totalDownloadables} label="Files & Forms" icon={Folder} color="bg-indigo-50 text-indigo-600" />
                    <StatBox count={stats.totalTourism} label="Tourism Spots" icon={Image} color="bg-emerald-50 text-emerald-600" />
                    <StatBox count={stats.totalOfficials} label="Org Officials" icon={Users} color="bg-amber-50 text-amber-600" />
                    <StatBox count={stats.totalDepartments} label="Offices" icon={Landmark} color="bg-purple-50 text-purple-600" />
                    <StatBox count={stats.totalServices} label="Citizen Services" icon={Building2} color="bg-teal-50 text-teal-600" />
                  </div>

                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-wider text-xs mb-1">Database Connectivity</h4>
                      <p className="text-gray-400 text-xs font-bold leading-relaxed">
                        {isSupabaseConfigured
                          ? "Connected to Live Supabase Backend database. Content changes will propagate immediately to the citizen-facing portal."
                          : "Supabase credentials not configured in environmental variables. Falling back to secure Browser Storage mode with identical schemas."
                        }
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${isSupabaseConfigured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {isSupabaseConfigured ? "LIVE DB CONNECTED" : "OFFLINE FALLBACK"}
                    </span>
                  </div>

                  {/* RECENT ACTIVITY FEED */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Administrative Activities</h3>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden bg-white">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-xs font-black text-gray-900">
                              {log.user_email} <span className="text-blue-600 font-bold">[{log.action}]</span> {log.target_table} ({log.target_id})
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <Activity size={16} className="text-gray-300" />
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <p className="p-6 text-center text-gray-400 font-bold text-xs">No admin logs recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NEWS PANEL */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">News Articles</h3>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{news.length} Total</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Article / Title</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Publish Date</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900 max-w-xs truncate">{item.title}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.category}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 font-bold">{item.date}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('news', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('news', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {news.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DOWNLOADABLES PANEL */}
              {activeTab === 'downloadables' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Municipal Forms & Library</h3>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{downloadables.length} Assets</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">File Size</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {downloadables.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900 max-w-xs truncate">{item.title}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.category}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 font-bold">{item.file_size}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('downloadables', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('downloadables', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {downloadables.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TOURISM PANEL */}
              {activeTab === 'tourism' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Eco-Cultural Tourist Spots</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tourismSpots.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all">
                        {item.featured_image && (
                          <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.featured_image})` }} />
                        )}
                        <div className="p-6 flex-grow space-y-3">
                          <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">{item.name}</h4>
                          <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">{item.description}</p>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 pt-2">
                            <Clock size={12} /> Hours: {item.opening_hours}
                          </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                          <button onClick={() => openEditEntity('tourism', item)} className="px-4 py-2 text-xs font-black bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1">
                            <Edit3 size={12} /> Edit Details
                          </button>
                          <button onClick={() => handleDeleteEntity('tourism', item.id)} className="px-4 py-2 text-xs font-black bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {tourismSpots.length === 0 && <p className="col-span-2 text-center py-12 text-gray-400 font-bold text-xs">No registered tourist spots.</p>}
                  </div>
                </div>
              )}

              {/* PUBLIC EVENTS PANEL */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">LGU Public Events</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Title</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Venue</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900">{item.title}</td>
                            <td className="px-6 py-4 text-gray-500">
                              <span className="font-bold block text-gray-900">{item.date}</span>
                              <span className="text-[10px]">{item.time}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 font-bold">{item.venue}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('events', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('events', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {events.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OFFICIALS PANEL */}
              {activeTab === 'officials' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Officials Directory</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Position / Title</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {officials.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 text-blue-600 font-black">{item.role}</td>
                            <td className="px-6 py-4 text-gray-400 font-bold">{item.department || "LGU"}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('officials', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('officials', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {officials.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DEPARTMENTS PANEL */}
              {activeTab === 'departments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Municipal Offices & Departments</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Office Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Head of Office</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Contact</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{item.head_of_office || "Unspecified"}</td>
                            <td className="px-6 py-4 text-gray-400 font-bold">{item.email || "N/A"}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('departments', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('departments', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {departments.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SERVICES CMS PANEL */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Citizen E-Services</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug Route</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Badge</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 font-mono text-gray-400 text-[10px]">{item.slug}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                item.status === 'available' ? 'bg-green-100 text-green-700' :
                                item.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('services', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('services', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {services.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CITIZEN CHARTER PANEL */}
              {activeTab === 'charter' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Citizen's Charter</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Office / Section</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Item</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Steps</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {charters.filter(c => c.service_name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors text-xs">
                            <td className="px-6 py-4 font-black text-gray-900">{item.office}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{item.service_name}</td>
                            <td className="px-6 py-4 text-blue-600 font-black">{item.steps?.length || 0} steps</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditEntity('charter', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteEntity('charter', item.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {charters.length === 0 && <NoDataRow colSpan={4} />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MEDIA LIBRARY PANEL */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Centralized Media Library</h3>
                    <p className="text-gray-400 text-xs font-bold mb-6">Browse and upload image and document attachments in your Supabase `public-assets` bucket.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Media upload column */}
                    <div className="md:col-span-1 border border-gray-100 p-6 rounded-[2rem] bg-gray-50">
                      <FileUpload
                        label="Direct Upload"
                        accept="*/*"
                        folder="media"
                        onUploadComplete={(url) => {
                          if (url) {
                            showSuccess("Media uploaded successfully!");
                            fetchMediaFiles();
                          }
                        }}
                      />
                    </div>

                    {/* Media files grid */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs"
                        />
                      </div>

                      {mediaLoading ? (
                        <div className="flex justify-center py-12"><LoaderSpin /></div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                          {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).map((file) => {
                            const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || file.metadata?.mimetype?.startsWith('image/');
                            const publicUrl = isSupabaseConfigured
                              ? supabase.storage.from('public-assets').getPublicUrl(file.name).data.publicUrl
                              : "#";

                            return (
                              <div key={file.id || file.name} className="border border-gray-100 p-4 rounded-2xl bg-white hover:border-blue-400 transition-all flex flex-col justify-between gap-3 text-xs">
                                <div>
                                  {isImage ? (
                                    <div className="h-24 w-full bg-cover bg-center rounded-xl mb-3 border border-gray-50" style={{ backgroundImage: `url(${publicUrl})` }} />
                                  ) : (
                                    <div className="h-24 w-full bg-gray-50 flex items-center justify-center text-gray-400 rounded-xl mb-3">
                                      <FileText size={28} />
                                    </div>
                                  )}
                                  <p className="font-black text-gray-900 truncate" title={file.name}>{file.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-gray-50">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(publicUrl);
                                      showSuccess("Public asset URL copied to clipboard!");
                                    }}
                                    className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest grow text-center"
                                  >
                                    Copy URL
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedia(file.name)}
                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {mediaFiles.length === 0 && (
                            <p className="col-span-2 text-center py-12 text-gray-400 font-bold">No assets found in bucket.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* USER MANAGEMENT PANEL (SUPER ADMIN ONLY) */}
              {activeTab === 'users' && isSuperAdminOrAdmin && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Staff Role Controls</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email address</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Role</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usersList.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-black text-gray-900">{item.email}</td>
                            <td className="px-6 py-4">
                              <select
                                value={item.role}
                                onChange={(e) => handleUpdateUserRole(item.id, e.target.value, item.is_verified)}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 text-xs focus:outline-none"
                              >
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="municipal_admin">Municipal Admin</option>
                                <option value="barangay_admin">Barangay Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {item.is_verified ? "Verified" : "Pending Verification"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleUpdateUserRole(item.id, item.role, !item.is_verified)}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${item.is_verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                              >
                                {item.is_verified ? "Deauthorize" : "Verify / Approve"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUDIT LOGS PANEL */}
              {activeTab === 'logs' && isSuperAdminOrAdmin && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Full System Audit Trails</h3>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden text-xs">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-gray-50">
                        <div>
                          <p className="font-black text-gray-900">
                            {log.user_email}
                          </p>
                          <p className="text-gray-400 font-bold mt-0.5">
                            Modified <span className="text-blue-600">[{log.target_table}]</span> entry {log.target_id}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="p-8 text-center text-gray-400 font-bold">No system changes recorded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* MEETING ASSISTANT PANEL */}
              {activeTab === 'meeting-assistant' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">AI Scribe & Meeting Assistant</h3>
                    <p className="text-gray-400 text-xs font-bold mb-6">Transcribe municipal hearings and draft executive session summaries automatically.</p>
                  </div>
                  <MeetingAssistant />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* CMS MODAL FOR CREATION & EDITING */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="CMS content editor">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    {editingId ? 'Modify' : 'Create'} {activeTab.replace('_', ' ')}
                  </h2>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-0.5">Municipal Record Database</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow space-y-6">
                
                {/* 1. NEWS FORM */}
                {activeTab === 'news' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-title">Article Title *</label>
                      <input id="news-title" type="text" required value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-cat">Category</label>
                        <select id="news-cat" value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="ARTICLE">Article</option>
                          <option value="ADVISORY">Advisory</option>
                          <option value="UPDATE">Update</option>
                          <option value="COMMUNITY">Community</option>
                          <option value="NOTICE">Notice</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-date">Publication Date</label>
                        <input id="news-date" type="date" required value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <FileUpload label="Featured Image (Optional)" accept="image/*" folder="news_images" currentValue={newsForm.image_url} onUploadComplete={(url) => setNewsForm({ ...newsForm, image_url: url })} />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-summary">Short Summary *</label>
                      <textarea id="news-summary" required rows={2} value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs resize-none" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-content">Full Content *</label>
                      <textarea id="news-content" required rows={6} value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <SubmitBtn label={editingId ? "Update news article" : "Publish news article"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 2. DOWNLOADABLES FORM */}
                {activeTab === 'downloadables' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-title">Document Name *</label>
                      <input id="dl-title" type="text" required value={downloadForm.title} onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-desc">Description</label>
                      <input id="dl-desc" type="text" value={downloadForm.description} onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-cat">Category</label>
                        <select id="dl-cat" value={downloadForm.category} onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="forms">Official Form</option>
                          <option value="ordinances">Ordinance / Legislation</option>
                          <option value="disclosure">Disclosure File</option>
                          <option value="reports">Report / Budget</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-size">File Size (e.g. 1.2 MB)</label>
                        <input id="dl-size" type="text" value={downloadForm.file_size} onChange={(e) => setDownloadForm({ ...downloadForm, file_size: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <FileUpload label="Secure File Attachment" folder="attachments" currentValue={downloadForm.file_url} onUploadComplete={(url) => setDownloadForm({ ...downloadForm, file_url: url })} />

                    <SubmitBtn label={editingId ? "Update library asset" : "Save library asset"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 3. TOURISM FORM */}
                {activeTab === 'tourism' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-name">Tourism Spot Name *</label>
                      <input id="tour-name" type="text" required value={tourismForm.name} onChange={(e) => setTourismForm({ ...tourismForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-desc">Full Description *</label>
                      <textarea id="tour-desc" required rows={4} value={tourismForm.description} onChange={(e) => setTourismForm({ ...tourismForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-hours">Opening Hours</label>
                        <input id="tour-hours" type="text" value={tourismForm.opening_hours} onChange={(e) => setTourismForm({ ...tourismForm, opening_hours: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-contact">Contact Details</label>
                        <input id="tour-contact" type="text" value={tourismForm.contact_details} onChange={(e) => setTourismForm({ ...tourismForm, contact_details: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-loc">Physical Location *</label>
                      <input id="tour-loc" type="text" required value={tourismForm.location} onChange={(e) => setTourismForm({ ...tourismForm, location: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-maps">Google Maps Embed/Share Link</label>
                      <input id="tour-maps" type="text" value={tourismForm.google_maps_link} onChange={(e) => setTourismForm({ ...tourismForm, google_maps_link: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Featured Landscape Image" folder="tourism" currentValue={tourismForm.featured_image} onUploadComplete={(url) => setTourismForm({ ...tourismForm, featured_image: url, gallery_images: url ? [url] : [] })} />

                    <SubmitBtn label={editingId ? "Update tourist spot details" : "Register tourist spot"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 4. OFFICIALS FORM */}
                {activeTab === 'officials' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-name">Official Name *</label>
                      <input id="off-name" type="text" required value={officialForm.name} onChange={(e) => setOfficialForm({ ...officialForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-role">Position / Title *</label>
                        <input id="off-role" type="text" required value={officialForm.role} onChange={(e) => setOfficialForm({ ...officialForm, role: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-dept">Department</label>
                        <input id="off-dept" type="text" value={officialForm.department} onChange={(e) => setOfficialForm({ ...officialForm, department: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-level">Hierarchy Level (1: Mayor, 2: Vice Mayor, 3: Council, 4: Barangay)</label>
                        <input id="off-level" type="number" value={officialForm.level} onChange={(e) => setOfficialForm({ ...officialForm, level: parseInt(e.target.value) || 3 })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-order">Display Order (weight)</label>
                        <input id="off-order" type="number" value={officialForm.display_order} onChange={(e) => setOfficialForm({ ...officialForm, display_order: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-contact">Email / Contact Information</label>
                      <input id="off-contact" type="text" value={officialForm.contact_info} onChange={(e) => setOfficialForm({ ...officialForm, contact_info: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-bio">Brief Biography</label>
                      <textarea id="off-bio" rows={3} value={officialForm.biography} onChange={(e) => setOfficialForm({ ...officialForm, biography: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Profile Portrait Photo" folder="officials" currentValue={officialForm.image_url} onUploadComplete={(url) => setOfficialForm({ ...officialForm, image_url: url })} />

                    <SubmitBtn label={editingId ? "Update official profile" : "Create official profile"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 5. DEPARTMENTS FORM */}
                {activeTab === 'departments' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-name">Department Name *</label>
                      <input id="dept-name" type="text" required value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-desc">Description & Mandate *</label>
                      <textarea id="dept-desc" required rows={3} value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-head">Head of Office</label>
                        <input id="dept-head" type="text" value={departmentForm.head_of_office} onChange={(e) => setDepartmentForm({ ...departmentForm, head_of_office: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-hours">Office Hours</label>
                        <input id="dept-hours" type="text" value={departmentForm.office_hours} onChange={(e) => setDepartmentForm({ ...departmentForm, office_hours: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-contact">Contact Number</label>
                        <input id="dept-contact" type="text" value={departmentForm.contact_number} onChange={(e) => setDepartmentForm({ ...departmentForm, contact_number: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-email">Office Email</label>
                        <input id="dept-email" type="email" value={departmentForm.email} onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-loc">Physical Location</label>
                      <input id="dept-loc" type="text" value={departmentForm.location} onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <SubmitBtn label={editingId ? "Update department record" : "Publish department record"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 6. SERVICES FORM */}
                {activeTab === 'services' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-name">Service Name *</label>
                      <input id="srv-name" type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-slug">Slug Route (optional)</label>
                      <input id="srv-slug" type="text" placeholder="e.g. apply-permit" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-desc">Description *</label>
                      <textarea id="srv-desc" required rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-purpose">Core Purpose / Target Audience</label>
                      <textarea id="srv-purpose" rows={2} value={serviceForm.purpose} onChange={(e) => setServiceForm({ ...serviceForm, purpose: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    {/* DYNAMIC REQUIREMENTS LIST */}
                    <div className="space-y-3 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Requirements Checklist</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add requirement bullet..."
                          value={tempReqInput}
                          onChange={(e) => setTempReqInput(e.target.value)}
                          className="grow bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempReqInput.trim()) {
                              setServiceForm({ ...serviceForm, requirements: [...serviceForm.requirements, tempReqInput.trim()] });
                              setTempReqInput('');
                            }
                          }}
                          className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        {serviceForm.requirements.map((req, index) => (
                          <div key={index} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs">
                            <span className="font-bold text-gray-800">{req}</span>
                            <button
                              type="button"
                              onClick={() => setServiceForm({ ...serviceForm, requirements: serviceForm.requirements.filter((_, i) => i !== index) })}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-time">Processing Time</label>
                        <input id="srv-time" type="text" value={serviceForm.processing_time} onChange={(e) => setServiceForm({ ...serviceForm, processing_time: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-fees">Fees / Dues</label>
                        <input id="srv-fees" type="text" value={serviceForm.fees} onChange={(e) => setServiceForm({ ...serviceForm, fees: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-office">Office Responsible</label>
                        <input id="srv-office" type="text" value={serviceForm.office_responsible} onChange={(e) => setServiceForm({ ...serviceForm, office_responsible: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-status">Availability Status</label>
                        <select id="srv-status" value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as any })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="available">Available</option>
                          <option value="coming-soon">Coming Soon</option>
                          <option value="maintenance">Under Maintenance</option>
                        </select>
                      </div>
                    </div>

                    {/* ATTACHED FORMS SECTION */}
                    <div className="space-y-3 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Attached Downloadable Forms</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Form title (e.g. Unified Form)"
                          value={tempFormTitle}
                          onChange={(e) => setTempFormTitle(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Direct URL (e.g. https://...)"
                            value={tempFormUrl}
                            onChange={(e) => setTempFormUrl(e.target.value)}
                            className="grow bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempFormTitle.trim() && tempFormUrl.trim()) {
                                const newForm = { title: tempFormTitle.trim(), url: tempFormUrl.trim(), fileSize: tempFormSize };
                                setServiceForm({ ...serviceForm, downloadable_forms: [...(serviceForm.downloadable_forms || []), newForm] });
                                setTempFormTitle('');
                                setTempFormUrl('');
                              }
                            }}
                            className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                          >
                            Attach
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        {serviceForm.downloadable_forms?.map((formItem, index) => (
                          <div key={index} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs">
                            <span className="font-bold text-indigo-600">{formItem.title}</span>
                            <button
                              type="button"
                              onClick={() => setServiceForm({ ...serviceForm, downloadable_forms: serviceForm.downloadable_forms?.filter((_, i) => i !== index) })}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <SubmitBtn label={editingId ? "Update service details" : "Register digital service"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 7. CITIZEN CHARTER FORM */}
                {activeTab === 'charter' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-office">Department / Office Name *</label>
                        <input id="cc-office" type="text" required value={charterForm.office} onChange={(e) => setCharterForm({ ...charterForm, office: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-name">Chartered Service Name *</label>
                        <input id="cc-name" type="text" required value={charterForm.service_name} onChange={(e) => setCharterForm({ ...charterForm, service_name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    {/* STEPS TIMELINE WRAPPER */}
                    <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 text-xs">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Workflow Timeline Steps</label>
                      
                      <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                        <div className="col-span-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">New step details</div>
                        <input
                          type="text"
                          placeholder="Client steps..."
                          value={tempStepClient}
                          onChange={(e) => setTempStepClient(e.target.value)}
                          className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Office action / Activity..."
                          value={tempStepActivity}
                          onChange={(e) => setTempStepActivity(e.target.value)}
                          className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 10 mins)..."
                          value={tempStepDuration}
                          onChange={(e) => setTempStepDuration(e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempStepActivity.trim()) {
                              const newStep = {
                                stepNumber: charterForm.steps.length + 1,
                                activity: tempStepActivity.trim(),
                                officeResponsible: tempStepOffice || charterForm.office,
                                duration: tempStepDuration || '5 mins',
                                clientSteps: tempStepClient || 'Submit forms'
                              };
                              setCharterForm({ ...charterForm, steps: [...charterForm.steps, newStep] });
                              setTempStepActivity('');
                              setTempStepClient('');
                              setTempStepDuration('');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold font-sans uppercase tracking-widest text-[9px]"
                        >
                          Push Step
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        {charterForm.steps.map((st, i) => (
                          <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="font-black text-blue-600">Step {st.stepNumber}: </span>
                              <span className="font-bold text-gray-800">{st.activity}</span>
                              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest">{st.duration} — {st.clientSteps}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = charterForm.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
                                setCharterForm({ ...charterForm, steps: filtered });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <SubmitBtn label={editingId ? "Update citizens charter" : "Publish citizens charter"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 8. EVENTS FORM */}
                {activeTab === 'events' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-title">Event Title *</label>
                      <input id="evt-title" type="text" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-date">Scheduled Date *</label>
                        <input id="evt-date" type="date" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-time">Scheduled Time *</label>
                        <input id="evt-time" type="text" required placeholder="e.g. 8:00 AM - 5:00 PM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-venue">Venue / Address *</label>
                      <input id="evt-venue" type="text" required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-desc">Full Description *</label>
                      <textarea id="evt-desc" required rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Event Banner Landscape Image" folder="event_banners" currentValue={eventForm.banner_image} onUploadComplete={(url) => setEventForm({ ...eventForm, banner_image: url })} />

                    <SubmitBtn label={editingId ? "Update scheduled event" : "Publish scheduled event"} isLoading={isActionLoading} />
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENT: SIDEBAR BUTTON
interface SidebarBtnProps {
  id: string;
  label: string;
  icon: React.ElementType;
  active: string;
  onClick: (val: any) => void;
}
const SidebarBtn: React.FC<SidebarBtnProps> = ({ id, label, icon: Icon, active, onClick }) => {
  const isSelected = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3.5 transition-all text-left ${
        isSelected
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
          : 'text-gray-400 hover:bg-white hover:text-gray-800'
      }`}
    >
      <Icon size={14} className={isSelected ? "text-white" : "text-gray-400"} />
      {label}
    </button>
  );
};

// COMPONENT: DASHBOARD STAT BOX
interface StatBoxProps {
  count: number;
  label: string;
  icon: React.ElementType;
  color: string;
}
const StatBox: React.FC<StatBoxProps> = ({ count, label, icon: Icon, color }) => {
  return (
    <div className="border border-gray-100 rounded-[2rem] p-6 hover:shadow-md transition-all flex items-center justify-between bg-white">
      <div className="space-y-1">
        <span className="text-2xl font-black text-gray-900 block tracking-tight">{count}</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

// COMPONENT: SUBMIT ACTION BUTTON
const SubmitBtn: React.FC<{ label: string; isLoading: boolean }> = ({ label, isLoading }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/15 uppercase sticky bottom-0"
    >
      {isLoading ? <LoaderSpin /> : label}
    </button>
  );
};

// COMPONENT: TABLE EMPTY DATA ROW
const NoDataRow: React.FC<{ colSpan: number }> = ({ colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-12 text-gray-400 font-bold text-xs uppercase tracking-widest">
        No records found matching search queries.
      </td>
    </tr>
  );
};

// COMPONENT: ROTATIONAL SPINNING LOADER
const LoaderSpin = () => <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;

export default AdminDashboard;
