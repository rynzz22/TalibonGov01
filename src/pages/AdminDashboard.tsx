import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn, LogOut, Trash2, FileText, CheckCircle,
  AlertCircle, ShieldCheck, Plus, X, Search,
  Newspaper, Users, Gavel, LayoutDashboard,
  Edit3, Save, Globe, Building2, Mic
} from 'lucide-react';
import MeetingAssistant from '../components/MeetingAssistant';
import FileUpload from '../components/FileUpload';
import { BARANGAYS } from '../constants/barangayConfig';

function sanitizeText(input: string, maxLength = 500): string {
  return input.trim().slice(0, maxLength);
}

const AdminDashboard: React.FC = () => {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'news' | 'resolutions' | 'officials' | 'ordinances' | 'meeting-assistant' | 'navigation' | 'pages'
  >('news');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [news, setNews] = useState<any[]>([]);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [officials, setOfficials] = useState<any[]>([]);
  const [ordinances, setOrdinances] = useState<any[]>([]);
  const [navigation, setNavigation] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);

  const [newsForm, setNewsForm] = useState({
    title: '', content: '', summary: '', category: 'ARTICLE',
    image_url: '', file_url: '', date: new Date().toISOString().split('T')[0],
  });
  const [resForm, setResForm] = useState({ no: '', date: '', author: '', title: '', file_url: '' });
  const [offForm, setOffForm] = useState({ name: '', role: '', level: 3, display_order: 0, image_url: '' });
  const [ordForm, setOrdForm] = useState({
    title: '', year: new Date().getFullYear().toString(),
    file_url: '', file_size: '2 MB', barangay_id: '',
  });
  const [navForm, setNavForm] = useState({
    name: '', href: '', section: 'NEWS', order: 0, is_external: false, is_hash: false,
  });
  const [pageForm, setPageForm] = useState({ slug: '', title: '', body_json: '' });

  const canAccessManagement =
    profile && profile.is_verified &&
    (profile.role === 'municipal_admin' || profile.role === 'barangay_admin');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 6000);
  };

  const fetchAll = useCallback(async () => {
    if (!canAccessManagement || !profile) return;

    try {
      let newsQuery = supabase.from('news').select('*').order('date', { ascending: false });
      if (profile.role === 'barangay_admin') {
        newsQuery = newsQuery.eq('barangay_id', profile.barangay_id);
      } else {
        newsQuery = newsQuery.is('barangay_id', null);
      }
      const { data: newsData } = await newsQuery;
      if (newsData) setNews(newsData);

      let ordQuery = supabase.from('ordinances').select('*').order('year', { ascending: false });
      if (profile.role === 'barangay_admin') {
        ordQuery = ordQuery.eq('barangay_id', profile.barangay_id);
      }
      const { data: ordData } = await ordQuery;
      if (ordData) setOrdinances(ordData);

      if (profile.role === 'municipal_admin') {
        const { data: resData } = await supabase
          .from('resolutions').select('*').order('no', { ascending: false });
        if (resData) setResolutions(resData);

        const { data: offData } = await supabase
          .from('officials').select('*')
          .order('level', { ascending: true })
          .order('display_order', { ascending: true });
        if (offData) setOfficials(offData);

        const { data: navData } = await supabase
          .from('navigation').select('*').order('order', { ascending: true });
        if (navData) setNavigation(navData);

        const { data: pageData } = await supabase
          .from('content').select('*').order('slug', { ascending: true });
        if (pageData) setPages(pageData);
      }
    } catch (err) {
      console.error('[AdminDashboard] fetchAll error:', err);
    }
  }, [canAccessManagement, profile]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!canAccessManagement) return;
    const channels = [
      supabase.channel('admin-news').on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchAll).subscribe(),
      supabase.channel('admin-ordinances').on('postgres_changes', { event: '*', schema: 'public', table: 'ordinances' }, fetchAll).subscribe(),
      supabase.channel('admin-resolutions').on('postgres_changes', { event: '*', schema: 'public', table: 'resolutions' }, fetchAll).subscribe(),
      supabase.channel('admin-officials').on('postgres_changes', { event: '*', schema: 'public', table: 'officials' }, fetchAll).subscribe(),
      supabase.channel('admin-navigation').on('postgres_changes', { event: '*', schema: 'public', table: 'navigation' }, fetchAll).subscribe(),
      supabase.channel('admin-pages').on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, fetchAll).subscribe(),
    ];
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
  }, [canAccessManagement, fetchAll]);

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      showError("Title and content are required.");
      return;
    }
    try {
      const payload = {
        title: sanitizeText(newsForm.title, 200),
        content: sanitizeText(newsForm.content, 10000),
        summary: sanitizeText(newsForm.summary, 1000),
        category: newsForm.category,
        image_url: newsForm.image_url,
        file_url: newsForm.file_url,
        date: newsForm.date,
        barangay_id: profile?.role === 'barangay_admin' ? profile.barangay_id : null,
      };
      if (editingId) {
        const { error } = await supabase.from('news').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("News updated successfully!");
      } else {
        const { error } = await supabase.from('news').insert([payload]);
        if (error) throw error;
        showSuccess("News published!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save news.");
    }
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.no.trim() || !resForm.title.trim()) {
      showError("Resolution number and title are required.");
      return;
    }
    try {
      const payload = {
        no: sanitizeText(resForm.no, 20),
        date: sanitizeText(resForm.date, 20),
        author: sanitizeText(resForm.author, 200),
        title: sanitizeText(resForm.title, 500),
        file_url: resForm.file_url,
      };
      if (editingId) {
        const { error } = await supabase.from('resolutions').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("Resolution updated!");
      } else {
        const { error } = await supabase.from('resolutions').insert([payload]);
        if (error) throw error;
        showSuccess("Resolution added!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save resolution.");
    }
  };

  const handleSaveOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offForm.name.trim() || !offForm.role.trim()) {
      showError("Name and role are required.");
      return;
    }
    try {
      const payload = {
        name: sanitizeText(offForm.name, 100),
        role: sanitizeText(offForm.role, 200),
        level: offForm.level,
        display_order: offForm.display_order,
        image_url: offForm.image_url,
      };
      if (editingId) {
        const { error } = await supabase.from('officials').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("Official updated!");
      } else {
        const { error } = await supabase.from('officials').insert([payload]);
        if (error) throw error;
        showSuccess("Official added!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save official.");
    }
  };

  const handleSaveOrdinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordForm.title.trim() || !ordForm.year.trim()) {
      showError("Title and year are required.");
      return;
    }
    const yearNum = parseInt(ordForm.year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      showError("Please enter a valid year.");
      return;
    }
    try {
      const payload = {
        title: sanitizeText(ordForm.title, 500),
        year: yearNum,
        file_url: ordForm.file_url,
        file_size: sanitizeText(ordForm.file_size, 20),
        barangay_id:
          profile?.role === 'barangay_admin'
            ? profile.barangay_id
            : ordForm.barangay_id || null,
      };
      if (editingId) {
        const { error } = await supabase.from('ordinances').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("Ordinance updated!");
      } else {
        const { error } = await supabase.from('ordinances').insert([payload]);
        if (error) throw error;
        showSuccess("Ordinance added!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save ordinance.");
    }
  };

  const handleSaveNavigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navForm.name.trim() || !navForm.href.trim()) {
      showError("Name and URL are required.");
      return;
    }
    try {
      const payload = {
        name: sanitizeText(navForm.name, 100),
        href: sanitizeText(navForm.href, 500),
        section: navForm.section,
        order: navForm.order,
        is_external: navForm.is_external,
        is_hash: navForm.is_hash,
      };
      if (editingId) {
        const { error } = await supabase.from('navigation').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("Navigation link updated!");
      } else {
        const { error } = await supabase.from('navigation').insert([payload]);
        if (error) throw error;
        showSuccess("Navigation link added!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save navigation link.");
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.slug.trim() || !pageForm.title.trim() || !pageForm.body_json.trim()) {
      showError("Slug, title, and content are required.");
      return;
    }
    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(pageForm.body_json);
      } catch (e) {
        showError("Invalid JSON format. Check your braces and quotes.");
        return;
      }

      const payload = {
        slug: pageForm.slug.trim().toLowerCase(),
        title: pageForm.title,
        body: parsedBody,
      };

      if (activeTab === 'pages') {
        const { error } = await supabase.from('content').update(payload).eq('slug', editingId);
        if (error) throw error;
        showSuccess("Page content updated!");
      } else if (editingId) {
        const { error } = await supabase.from(activeTab === 'news' ? 'news' : activeTab === 'resolutions' ? 'resolutions' : activeTab === 'officials' ? 'officials' : activeTab === 'ordinances' ? 'ordinances' : 'navigation').update(payload).eq('id', editingId);
        if (error) throw error;
        showSuccess("Updated successfully!");
      } else {
        const { error } = await supabase.from(activeTab === 'news' ? 'news' : activeTab === 'resolutions' ? 'resolutions' : activeTab === 'officials' ? 'officials' : activeTab === 'ordinances' ? 'ordinances' : 'navigation').insert([payload]);
        if (error) throw error;
        showSuccess("Created successfully!");
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      showError(err.message ?? "Failed to save page.");
    }
  };

  const handleDelete = async (tab: typeof activeTab, id: string) => {
    if (!tab) return;
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;
    try {
      const table = tab === 'pages' ? 'content' : tab === 'news' ? 'news' : tab === 'resolutions' ? 'resolutions' : tab === 'officials' ? 'officials' : tab === 'ordinances' ? 'ordinances' : 'navigation';
      const key = tab === 'pages' ? 'slug' : 'id';
      
      const { error } = await supabase.from(table).delete().eq(key, id);
      if (error) throw error;
      showSuccess("Deleted successfully.");
    } catch (err: any) {
      showError(err.message ?? "Delete failed.");
    }
  };

  const resetForms = () => {
    setNewsForm({ title: '', content: '', summary: '', category: 'ARTICLE', image_url: '', file_url: '', date: new Date().toISOString().split('T')[0] });
    setResForm({ no: '', date: '', author: '', title: '', file_url: '' });
    setOffForm({ name: '', role: '', level: 3, display_order: 0, image_url: '' });
    setOrdForm({ title: '', year: new Date().getFullYear().toString(), file_url: '', file_size: '2 MB', barangay_id: '' });
    setNavForm({ name: '', href: '', section: 'NEWS', order: 0, is_external: false, is_hash: false });
    setPageForm({ slug: '', title: '', body_json: '' });
    setEditingId(null);
  };

  const openEdit = (type: typeof activeTab, item: any) => {
    const editId = type === 'pages' ? item.slug : item.id;
    setEditingId(editId);
    setActiveTab(type);
    if (type === 'news') setNewsForm({ title: item.title, content: item.content, summary: item.summary ?? '', category: item.category, image_url: item.image_url ?? '', file_url: item.file_url ?? '', date: item.date });
    if (type === 'resolutions') setResForm({ no: item.no, date: item.date, author: item.author ?? '', title: item.title, file_url: item.file_url ?? '' });
    if (type === 'officials') setOffForm({ name: item.name, role: item.role, level: item.level, display_order: item.display_order ?? 0, image_url: item.image_url ?? '' });
    if (type === 'ordinances') setOrdForm({ title: item.title, year: String(item.year), file_url: item.file_url ?? '', file_size: item.file_size ?? '2 MB', barangay_id: item.barangay_id ?? '' });
    if (type === 'navigation') setNavForm({ name: item.name, href: item.href, section: item.section, order: item.order ?? 0, is_external: item.is_external ?? false, is_hash: item.is_hash ?? false });
    if (type === 'pages') setPageForm({ slug: item.slug, title: item.title, body_json: JSON.stringify(item.body, null, 2) });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!user || !canAccessManagement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center"
          role="main"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
            <ShieldCheck size={40} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Admin Access</h1>
          <p className="text-gray-500 font-medium mb-12 leading-relaxed">
            This area is restricted to verified authorized personnel only.
          </p>

          {user && !profile && (
            <div className="mb-8 p-4 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              Profile registration required — please complete setup at /login
            </div>
          )}

          {profile && !profile.is_verified && (
            <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-2" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              Your account is pending administrator verification
            </div>
          )}

          {profile && profile.is_verified && !canAccessManagement && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-2" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              Access denied: insufficient role permissions
            </div>
          )}

          {!user && (
            <button
              onClick={signInWithGoogle}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
            >
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              Sign In with Google
            </button>
          )}

          {user && (
            <button
              onClick={signOut}
              className="w-full py-5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'news', label: 'News & Advisories', icon: Newspaper },
    ...(profile.role === 'municipal_admin' ? [
      { id: 'resolutions', label: 'Resolutions', icon: Gavel },
      { id: 'officials', label: 'Org Chart', icon: Users },
      { id: 'navigation', label: 'Navigation', icon: Globe },
      { id: 'pages', label: 'General Pages', icon: FileText },
    ] : []),
    { id: 'ordinances', label: 'Ordinances', icon: FileText },
    { id: 'meeting-assistant', label: 'Meeting AI', icon: Mic },
  ] as { id: typeof activeTab; label: string; icon: React.ElementType }[];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 md:pt-44 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <LayoutDashboard size={24} aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                CMS Dashboard
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-gray-400 font-bold text-sm tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-xs">Logged in as:</span>
              <span className="text-blue-600 text-xs">{user.email}</span>
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-1">
                {profile.role === 'municipal_admin' ? <Globe size={10} aria-hidden="true" /> : <Building2 size={10} aria-hidden="true" />}
                {profile.role.replace('_', ' ')}
              </span>
              {profile.barangay_id && (
                <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-[10px] uppercase font-black tracking-[0.2em]">
                  Scope: {profile.barangay_id}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { resetForms(); setIsModalOpen(true); }}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
              aria-label="Add new content"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" aria-hidden="true" />
              Add New
            </button>
            <button
              onClick={signOut}
              className="px-8 py-4 bg-white text-gray-400 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-100 border border-gray-100 transition-all flex items-center gap-2"
            >
              <LogOut size={18} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <tab.icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden" role="tabpanel">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              {activeTab === 'news' && 'News Management'}
              {activeTab === 'resolutions' && 'Resolutions Management'}
              {activeTab === 'ordinances' && 'Ordinances Management'}
              {activeTab === 'officials' && 'Officials Management'}
              {activeTab === 'navigation' && 'Navigation Management'}
              {activeTab === 'meeting-assistant' && 'AI Meeting Assistant'}
            </h2>
          </div>

          <div className="overflow-x-auto">
              {activeTab === 'pages' && profile.role === 'municipal_admin' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Title</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pages.length === 0 ? (
                      <tr><td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No general pages managed yet.</td></tr>
                    ) : pages.map((item) => (
                      <tr key={item.slug} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6 font-black text-blue-600">{item.slug}</td>
                        <td className="px-8 py-6 font-bold text-gray-900">{item.title}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit('pages', item)} aria-label="Edit page" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete('pages', item.slug)} aria-label="Delete page" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'meeting-assistant' && <MeetingAssistant />}

            {activeTab === 'news' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {news.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No news items yet. Click "Add New" to get started.</td></tr>
                  ) : news.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900 max-w-xs truncate">{item.title}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-400">{item.date}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit('news', item)} aria-label="Edit news" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('news', item.id)} aria-label="Delete news" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'resolutions' && profile.role === 'municipal_admin' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">No.</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resolutions.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No resolutions yet.</td></tr>
                  ) : resolutions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-black text-blue-600">{item.no}</td>
                      <td className="px-8 py-6 font-bold text-gray-900 max-w-xs truncate">{item.title}</td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-400">{item.date}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit('resolutions', item)} aria-label="Edit resolution" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('resolutions', item.id)} aria-label="Delete resolution" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'ordinances' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Year</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ordinances.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No ordinances yet.</td></tr>
                  ) : ordinances.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900 max-w-md truncate">{item.title}</td>
                      <td className="px-8 py-6 font-black text-blue-600">{item.year}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit('ordinances', item)} aria-label="Edit ordinance" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('ordinances', item.id)} aria-label="Delete ordinance" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'officials' && profile.role === 'municipal_admin' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {officials.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No officials yet.</td></tr>
                  ) : officials.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{item.name}</td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-500 max-w-xs truncate">{item.role}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Level {item.level}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit('officials', item)} aria-label="Edit official" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('officials', item.id)} aria-label="Delete official" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'navigation' && profile.role === 'municipal_admin' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Section</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {navigation.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No navigation links yet.</td></tr>
                  ) : navigation.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{item.name}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.section}</span>
                      </td>
                      <td className="px-8 py-6 font-black text-blue-600">{item.order}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit('navigation', item)} aria-label="Edit nav link" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete('navigation', item.id)} aria-label="Delete nav link" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Content editor">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {editingId ? 'Edit' : 'Add New'} {activeTab === 'news' ? 'News' : activeTab === 'resolutions' ? 'Resolution' : activeTab === 'officials' ? 'Official' : activeTab === 'ordinances' ? 'Ordinance' : 'Navigation Link'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} aria-label="Close editor" className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={24} /></button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {activeTab === 'news' && (
                  <form onSubmit={handleSaveNews} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-title">Title *</label>
                      <input id="news-title" type="text" required maxLength={200} value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-cat">Category</label>
                        <select id="news-cat" value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20">
                          <option value="ARTICLE">Article</option>
                          <option value="ADVISORY">Advisory</option>
                          <option value="DISASTER">Disaster Preparedness</option>
                          <option value="UPDATE">Update</option>
                          <option value="GALLERY">Gallery</option>
                          <option value="COMMUNITY">Community</option>
                          <option value="NOTICE">Notice</option>
                          <option value="FORM">Downloadable Form</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-date">Date *</label>
                        <input id="news-date" type="date" required value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                    </div>
                    <FileUpload label="Feature Image" accept="image/*" folder="news/images" currentValue={newsForm.image_url} onUploadComplete={(url) => setNewsForm({ ...newsForm, image_url: url })} />
                    {newsForm.category === 'FORM' && (
                      <FileUpload label="Downloadable Form (PDF)" accept=".pdf" folder="news/forms" currentValue={newsForm.file_url} onUploadComplete={(url) => setNewsForm({ ...newsForm, file_url: url })} />
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-summary">Summary *</label>
                      <textarea id="news-summary" required rows={2} maxLength={1000} value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-content">Content *</label>
                      <textarea id="news-content" required rows={6} maxLength={10000} value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Publish'} News
                    </button>
                  </form>
                )}

                {activeTab === 'resolutions' && profile.role === 'municipal_admin' && (
                  <form onSubmit={handleSaveResolution} className="space-y-6" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="res-no">Resolution No. *</label>
                        <input id="res-no" type="text" required maxLength={20} value={resForm.no} onChange={(e) => setResForm({ ...resForm, no: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="res-date">Date Approved</label>
                        <input id="res-date" type="text" placeholder="MM/DD/YYYY" maxLength={20} value={resForm.date} onChange={(e) => setResForm({ ...resForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="res-title">Title *</label>
                      <input id="res-title" type="text" required maxLength={500} value={resForm.title} onChange={(e) => setResForm({ ...resForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="res-author">Author/Sponsor</label>
                      <input id="res-author" type="text" maxLength={200} value={resForm.author} onChange={(e) => setResForm({ ...resForm, author: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <FileUpload label="Resolution PDF" accept=".pdf" folder="resolutions" currentValue={resForm.file_url} onUploadComplete={(url) => setResForm({ ...resForm, file_url: url })} />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Save'} Resolution
                    </button>
                  </form>
                )}

                {activeTab === 'ordinances' && (
                  <form onSubmit={handleSaveOrdinance} className="space-y-6" noValidate>
                    {profile.role === 'municipal_admin' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="ord-scope">Jurisdiction / Scope</label>
                        <select id="ord-scope" value={ordForm.barangay_id} onChange={(e) => setOrdForm({ ...ordForm, barangay_id: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20">
                          <option value="">Municipal (whole-site visibility)</option>
                          {BARANGAYS.map((b) => (<option key={b.slug} value={b.slug}>{b.name}</option>))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="ord-title">Title *</label>
                      <input id="ord-title" type="text" required maxLength={500} value={ordForm.title} onChange={(e) => setOrdForm({ ...ordForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="ord-year">Year *</label>
                        <input id="ord-year" type="number" required min={1900} max={new Date().getFullYear() + 1} value={ordForm.year} onChange={(e) => setOrdForm({ ...ordForm, year: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="ord-size">File Size</label>
                        <input id="ord-size" type="text" placeholder="e.g. 2 MB" maxLength={20} value={ordForm.file_size} onChange={(e) => setOrdForm({ ...ordForm, file_size: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                    </div>
                    <FileUpload label="Ordinance PDF" accept=".pdf" folder="ordinances" currentValue={ordForm.file_url} onUploadComplete={(url) => setOrdForm({ ...ordForm, file_url: url })} />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Save'} Ordinance
                    </button>
                  </form>
                )}

                {activeTab === 'officials' && profile.role === 'municipal_admin' && (
                  <form onSubmit={handleSaveOfficial} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-name">Full Name *</label>
                      <input id="off-name" type="text" required maxLength={100} value={offForm.name} onChange={(e) => setOffForm({ ...offForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-role">Role / Designation *</label>
                      <input id="off-role" type="text" required maxLength={200} value={offForm.role} onChange={(e) => setOffForm({ ...offForm, role: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-level">Hierarchy Level</label>
                        <select id="off-level" value={offForm.level} onChange={(e) => setOffForm({ ...offForm, level: parseInt(e.target.value) })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20">
                          <option value={1}>Level 1 — Mayor</option>
                          <option value={2}>Level 2 — Admin/SB</option>
                          <option value={3}>Level 3 — Department</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-order">Display Order</label>
                        <input id="off-order" type="number" min={0} value={offForm.display_order} onChange={(e) => setOffForm({ ...offForm, display_order: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                    </div>
                    <FileUpload label="Profile Picture / Department Logo" accept="image/*" folder="officials/images" currentValue={offForm.image_url} onUploadComplete={(url) => setOffForm({ ...offForm, image_url: url })} />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Save'} Official
                    </button>
                  </form>
                )}

                {activeTab === 'pages' && profile.role === 'municipal_admin' && (
                  <form onSubmit={handleSavePage} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="page-slug">Slug (System ID) *</label>
                      <input id="page-slug" type="text" required placeholder="e.g., about-history" value={pageForm.slug} readOnly={!!editingId} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} className={`w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 ${editingId ? 'opacity-50' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="page-title">Display Title *</label>
                      <input id="page-title" type="text" required value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="page-body">Body Data (JSON) *</label>
                      <textarea id="page-body" required rows={10} value={pageForm.body_json} onChange={(e) => setPageForm({ ...pageForm, body_json: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-mono text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none" placeholder='{ "content": "Your text here..." }' />
                    </div>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Create'} Page Content
                    </button>
                  </form>
                )}

                {activeTab === 'navigation' && profile.role === 'municipal_admin' && (
                  <form onSubmit={handleSaveNavigation} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="nav-name">Link Name *</label>
                      <input id="nav-name" type="text" required maxLength={100} value={navForm.name} onChange={(e) => setNavForm({ ...navForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="nav-href">URL / Path *</label>
                      <input id="nav-href" type="text" required maxLength={500} value={navForm.href} onChange={(e) => setNavForm({ ...navForm, href: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="nav-section">Section</label>
                        <select id="nav-section" value={navForm.section} onChange={(e) => setNavForm({ ...navForm, section: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20">
                          {['NEWS','ABOUT','EXECUTIVE','LEGISLATIVE','TRANSPARENCY','TOURISM','FORMS'].map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="nav-order">Order</label>
                        <input id="nav-order" type="number" min={0} value={navForm.order} onChange={(e) => setNavForm({ ...navForm, order: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={navForm.is_external} onChange={(e) => setNavForm({ ...navForm, is_external: e.target.checked })} className="sr-only" />
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${navForm.is_external ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${navForm.is_external ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">External Link</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={navForm.is_hash} onChange={(e) => setNavForm({ ...navForm, is_hash: e.target.checked })} className="sr-only" />
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${navForm.is_hash ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${navForm.is_hash ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hash Link</span>
                      </label>
                    </div>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Save size={18} aria-hidden="true" />
                      {editingId ? 'Update' : 'Save'} Navigation Link
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(successMsg || errorMsg) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            role="alert"
            aria-live="assertive"
            className={`fixed bottom-8 right-8 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[120] ${
              successMsg ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {successMsg ? <CheckCircle size={20} aria-hidden="true" /> : <AlertCircle size={20} aria-hidden="true" />}
            <span className="font-bold text-sm">{successMsg ?? errorMsg}</span>
            <button
              onClick={() => { setSuccessMsg(null); setErrorMsg(null); }}
              aria-label="Dismiss notification"
              className="ml-4 opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
