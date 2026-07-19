import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, ChevronDown, ArrowUpRight, Phone, Mail, MapPin, Search, Accessibility, Bell, Clock, LogIn, LayoutDashboard, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import NotificationDrawer from "./NotificationDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/SupabaseAuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import GlobalSearch from "./GlobalSearch";
import { useIsScrolled } from "../hooks/useIsScrolled";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut, state } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dynamicNavLinks, setDynamicNavLinks] = useState<any[]>([]);
  const location = useLocation();
  
  const isScrolled = useIsScrolled(80);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isUserAuthenticated = state === "AUTHENTICATED" && profile !== null && profile.is_verified;

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const fetchNav = async () => {
      const { data, error } = await supabase
        .from('navigation')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.warn("Error fetching navigation:", error);
      } else {
        setDynamicNavLinks(data);
      }
    };

    fetchNav();

    const channel = supabase
      .channel('nav-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'navigation' }, () => fetchNav())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getSubLinks = (sectionName: string, defaultLinks: any[]) => {
    const dynamicLinks = dynamicNavLinks.filter(l => l.section === sectionName);
    return dynamicLinks.length > 0 ? dynamicLinks : defaultLinks;
  };

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).replace(',', '');
  };

  const topNavLinks = [
    { name: t('home'), href: "/", isHash: false },
    { 
      name: t('about'), 
      href: "#",
      subLinks: getSubLinks("ABOUT", [
        { name: "Brief Profile", href: "/about/profile" },
        { name: "Official Seal", href: "/about/seal" },
        { name: "Brief History", href: "/about/history" },
        { name: "List of Mayors", href: "/about/mayors" },
        { name: "Vicinity Map", href: "/about/vicinity" },
        { name: "Industry", href: "/about/industry" },
        { name: "Government Services", href: "/e-services" },
        { name: "Talibon Hymn", href: "/about/hymn" },
      ])
    },
    { 
      name: "Local Government", 
      href: "#",
      subLinks: [
        { name: "Executive Mandate", href: "/executive/mandate" },
        { name: "Legislative Mandate", href: "/legislative/mandate" },
        { name: "Organizational Chart", href: "/executive/chart" },
        { name: "Departments & Offices", href: "/about/departments" },
      ]
    },
    { name: "Citizen's Charter", href: "/transparency/charter", isHash: false },
    { name: "E-SERVICES", href: "/#popular-services", isHash: true },
  ];

  const secondaryNavLinks = [
    { 
      name: t('transparency'), 
      href: "/transparency/disclosure",
      subLinks: getSubLinks("TRANSPARENCY", [
        { name: "Full Disclosure Policy", href: "/transparency/disclosure" },
        { name: "Infrastructure Projects", href: "/transparency/infrastructure" },
        { name: "Finance Reports", href: "/transparency/finance" },
        { name: "Executive Orders", href: "/transparency/orders" },
        { name: "Budget", href: "/transparency/budget" },
        { name: "Biddings", href: "/transparency/biddings" },
      ])
    },
    { name: "BARANGAY PROFILES", href: "/about/barangays" },
    { name: "GAD-IMS", href: "/executive/gad-ims" },
    { name: "DOWNLOADABLES", href: "/downloads" },
    { 
      name: t('tourism'), 
      href: "#",
      subLinks: getSubLinks("TOURISM", [
        { name: "Interactive Map", href: "/tourism/map" },
        { name: "Tourist Spots", href: "/tourism/spots" },
        { name: "Festivities", href: "/tourism/festivities" },
        { name: "Local Delicacies", href: "/tourism/delicacies" },
      ])
    },
    { 
      name: "NEWS & UPDATES", 
      href: "/news/updates",
      subLinks: getSubLinks("NEWS", [
        { name: "Articles", href: "/news/articles" },
        { name: "Advisories", href: "/news/advisories" },
        { name: "Updates", href: "/news/updates" },
        { name: "Gallery", href: "/news/gallery" },
      ])
    },
    { name: "SOCIAL MEDIA", href: "https://web.facebook.com/TalibonOfficialPage?_rdc=1&_rdr#", isExternal: true },
  ];

  return (
    <motion.header 
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-auto shadow-2xl bg-[url('https://phillexevansnotebook.wordpress.com/wp-content/uploads/2019/01/20180410_153642.jpg')] bg-cover bg-center flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Immersive Overlay */}
      <div className="absolute inset-0 bg-brand-bg/92 backdrop-blur-[1.5px] -z-10" />

      {/* Tier 1: Utility Navigation */}
      <div className="bg-brand-bg/50 border-b border-brand-border backdrop-blur-md relative z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 h-10 flex justify-between items-center text-[10px] sm:text-xs">
          <div className="flex items-center gap-10 divide-x divide-brand-border">
            <Link to="/" className="font-extrabold text-brand-text hover:text-brand-primary transition-colors tracking-tight">GOVPH</Link>
            
            <nav className="hidden lg:flex items-center gap-8 pl-10">
              {topNavLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative h-10 flex items-center"
                  onMouseEnter={() => link.subLinks && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {link.subLinks ? (
                    <div className="flex flex-col h-full justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === link.name ? null : link.name);
                        }}
                        className="text-brand-text hover:text-brand-primary font-semibold flex items-center gap-1 transition-colors"
                      >
                        {link.name} <ChevronDown size={12} className={activeDropdown === link.name ? 'rotate-180' : ''} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 w-56 bg-brand-surface shadow-2xl border border-brand-border py-2 z-[70]"
                          >
                            {link.subLinks.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                target={sub.isExternal ? "_blank" : undefined}
                                rel={sub.isExternal ? "noopener noreferrer" : undefined}
                                className="block px-4 py-2 hover:bg-brand-bg text-brand-text hover:text-brand-primary transition-all text-xs font-semibold"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : link.isHash ? (
                    <HashLink 
                      to={link.href} 
                      scroll={(el) => {
                        const yOffset = -220;
                        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }}
                      className="text-brand-text hover:text-brand-primary font-semibold transition-colors"
                    >
                      {link.name}
                    </HashLink>
                  ) : (
                    <Link to={link.href} className="text-brand-text hover:text-brand-primary font-semibold transition-colors">
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-6 pl-10 border-l border-brand-border">
              {isUserAuthenticated && user ? (
                <div className="flex items-center gap-5">
                  {/* Administrator Identity Badge */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-xs shadow-sm">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-brand-text tracking-tight leading-none">
                        {profile?.full_name || user.email?.split("@")[0]}
                      </span>
                      <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mt-1 leading-none">
                        {profile?.role?.replace("_", " ") || "Staff"}
                      </span>
                    </div>
                  </div>

                  <Link to="/admin" className="flex items-center gap-1.5 text-brand-primary font-extrabold uppercase tracking-widest hover:opacity-85 transition-colors text-[10px]">
                    <LayoutDashboard size={13} />
                    DASHBOARD
                  </Link>
                  <button onClick={() => signOut()} className="flex items-center gap-1.5 text-brand-muted font-extrabold uppercase tracking-widest hover:text-red-600 transition-colors text-[10px]">
                    <LogOut size={13} />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-brand-primary font-extrabold uppercase tracking-widest hover:opacity-80 transition-all">
                  <LogIn size={14} />
                  ADMIN LOGIN
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-brand-text font-semibold">
            <div className="hidden xl:block">{formatTime(currentTime)} (PST)</div>
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary rounded-full transition-all text-[9px] font-black tracking-widest uppercase border border-brand-primary/10"
              >
                <Globe size={12} />
                {language === 'en' ? 'EN' : 'CEB'}
              </button>
              <ErrorBoundary componentName="NotificationBell">
                <NotificationBell onClick={() => setIsNotificationOpen(true)} />
              </ErrorBoundary>
              <button className="hover:text-brand-primary text-brand-text transition-colors"><Accessibility size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Branding Header */}
      <div className={`bg-transparent border-b border-gray-100/50 relative z-10 transition-all duration-300 ease-in-out overflow-hidden ${
        isScrolled 
          ? "h-0 py-0 opacity-0 pointer-events-none border-none" 
          : "py-6 lg:py-8"
      }`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Left Section: Logos */}
          <div className="flex items-center gap-4 w-1/4">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="p-1.5 bg-white rounded-full shadow-lg border-2 border-brand-primary/20 group-hover:border-brand-primary transition-all duration-300">
                <img 
                  src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
                  alt="Talibon Seal" 
                  className="object-contain transition-all duration-300 rounded-full group-hover:rotate-6 w-16 h-16 sm:w-20 sm:h-20" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bagong_Pilipinas_logo.png/1920px-Bagong_Pilipinas_logo.png" 
                alt="Bagong Pilipinas" 
                className="hidden xl:block object-contain h-10" 
                referrerPolicy="no-referrer" 
              />
            </Link>
          </div>

          {/* Middle Section: Centered Text */}
          <Link to="/" className="flex-1 flex flex-col items-center text-center px-4 transition-transform hover:scale-[1.01]">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-3 py-0.5 bg-brand-primary text-white text-[9px] font-black rounded-full animate-pulse tracking-widest shadow-sm">#TALIBOOM</div>
              </div>
              <h1 className="font-display font-black text-brand-primary tracking-tighter leading-none mb-1 drop-shadow-sm text-xl sm:text-3xl lg:text-4xl">MUNICIPALITY OF TALIBON</h1>
              <div className="flex items-center gap-2">
                <p className="text-brand-secondary font-black tracking-[0.25em] uppercase opacity-90 text-[9px] sm:text-xs lg:text-sm">BOHOL'S SEAFOOD CAPITAL 🦀</p>
              </div>
            </div>
          </Link>

          {/* Right Section: Empty to balance the layout */}
          <div className="w-1/4 hidden lg:block" />
        </div>
      </div>

      {/* Tier 3: Secondary Navigation (Vibrant Bar) */}
      <div className={`bg-gradient-to-r from-orange-600/90 to-amber-500/90 backdrop-blur-md border-t border-white/10 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 flex items-center justify-between relative transition-all duration-300">
          
          {/* Left: Mini Seal & Title (Visible when scrolled) */}
          <div className="flex items-center gap-2 min-w-[120px] lg:min-w-[180px]">
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <img 
                    src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
                    alt="Talibon Seal" 
                    className="w-8 h-8 object-contain rounded-full bg-white p-0.5 shadow-md" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-white text-[11px] font-black tracking-widest uppercase font-display hidden sm:inline-block">
                    TALIBON
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {secondaryNavLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group/secondary"
                onMouseEnter={() => link.subLinks && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div className="flex flex-col">
                  {link.subLinks ? (
                    <div className="flex items-center">
                      <Link 
                        to={link.href} 
                        className={`pl-4 ${link.href === '#' ? 'pointer-events-none' : ''} ${
                          isScrolled ? 'py-2.5' : 'py-4'
                        } text-white text-[10px] font-bold tracking-wider hover:bg-white/10 transition-all duration-300`}
                      >
                        {link.name}
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === link.name ? null : link.name);
                        }}
                        className={`pr-4 ${
                          isScrolled ? 'py-2.5' : 'py-4'
                        } text-white hover:bg-white/10 transition-all duration-300`}
                      >
                        <ChevronDown size={14} className={activeDropdown === link.name ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to={link.href} 
                      target={link.isExternal ? "_blank" : undefined}
                      className={`px-4 ${
                        isScrolled ? 'py-2.5' : 'py-4'
                      } text-white text-[10px] font-bold tracking-wider hover:bg-white/10 transition-all duration-300 block`}
                    >
                      {link.name}
                    </Link>
                  )}
                  
                  <AnimatePresence>
                    {activeDropdown === link.name && link.subLinks && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-brand-surface shadow-2xl border border-brand-border py-3 z-[70] rounded-b-xl overflow-hidden"
                      >
                        {link.subLinks.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            className="block px-6 py-2.5 hover:bg-brand-primary/5 text-brand-text hover:text-brand-primary transition-all text-xs font-bold tracking-tight"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Search and Mobile Hamburger Buttons */}
          <div className="flex items-center gap-2 justify-end min-w-[120px] lg:min-w-[180px]">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`hover:bg-white/15 rounded-full text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center border border-transparent hover:border-white/20 ${
                isScrolled ? 'p-1.5' : 'p-2'
              }`}
              title="Search"
            >
              <Search size={16} className="stroke-[2.5]" />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden hover:bg-white/15 rounded-full text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center border border-transparent hover:border-white/20 ${
                isScrolled ? 'p-1.5' : 'p-2'
              }`}
              title="Menu"
            >
              {isOpen ? <X size={20} className="stroke-[2.5]" /> : <Menu size={20} className="stroke-[2.5]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[100] bg-brand-bg lg:hidden overflow-y-auto"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <img src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" alt="Seal" className="h-16" />
                <button onClick={() => setIsOpen(false)} className="p-2 border border-brand-primary rounded-xl text-brand-primary"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Menu</p>
                {topNavLinks.map(link => (
                  <div key={link.name}>
                    {link.subLinks ? (
                      <>
                        <button 
                          onClick={() => setMobileSubMenu(mobileSubMenu === link.name ? null : link.name)}
                          className="w-full text-left py-2 text-lg font-black text-brand-text flex justify-between items-center"
                        >
                          {link.name} <ChevronDown size={18} />
                        </button>
                        {mobileSubMenu === link.name && (
                          <div className="pl-4 py-2 space-y-2 border-l-2 border-brand-primary/20">
                            {link.subLinks.map(sub => (
                              <Link key={sub.name} to={sub.href} onClick={() => setIsOpen(false)} className="block py-1 text-sm font-bold text-brand-muted">{sub.name}</Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : link.isHash ? (
                      <HashLink 
                        to={link.href} 
                        scroll={(el) => {
                          const yOffset = -160;
                          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }}
                        onClick={() => setIsOpen(false)} 
                        className="block py-2 text-lg font-black text-brand-text"
                      >
                        {link.name}
                      </HashLink>
                    ) : (
                      <Link 
                        to={link.href} 
                        onClick={() => setIsOpen(false)} 
                        className="block py-2 text-lg font-black text-brand-text"
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}

                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-8">Government Portal</p>
                {secondaryNavLinks.map(link => (
                  <div key={link.name}>
                    {link.subLinks ? (
                      <div>
                        <button 
                          onClick={() => setMobileSubMenu(mobileSubMenu === link.name ? null : link.name)}
                          className="w-full text-left py-2 text-lg font-black text-brand-primary flex justify-between items-center"
                        >
                          {link.name} <ChevronDown size={18} />
                        </button>
                        {mobileSubMenu === link.name && (
                          <div className="pl-4 py-2 space-y-2 border-l-2 border-brand-primary/20">
                            {link.subLinks.map(sub => (
                              <Link key={sub.name} to={sub.href} onClick={() => setIsOpen(false)} className="block py-1 text-sm font-bold text-brand-muted">{sub.name}</Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link to={link.href} onClick={() => setIsOpen(false)} className="block py-2 text-lg font-black text-brand-primary">{link.name}</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ErrorBoundary componentName="NotificationDrawer">
        <NotificationDrawer 
          isOpen={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
          onViewAction={(actionUrl) => {
            // If already on /admin page, update URL parameter or hash so component reacts, otherwise redirect
            if (window.location.pathname === "/admin") {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("tab", actionUrl);
              window.history.pushState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
              // Dispatch a window event to let AdminDashboard know the active tab changed
              window.dispatchEvent(new CustomEvent("talibon_tab_changed", { detail: actionUrl }));
            } else {
              window.location.href = `/admin?tab=${actionUrl}`;
            }
          }}
        />
      </ErrorBoundary>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </motion.header>
  );
}