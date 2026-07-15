import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { UserProfile } from "../contexts/SupabaseAuthContext";

export type NotificationCategory =
  | "Citizen Applications"
  | "Workflow Updates"
  | "Staff Verification"
  | "News Approval"
  | "Document Updates"
  | "System Messages"
  | "Department Announcements";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  department_id?: string | null; // e.g., "dept-1", "dept-2"
  user_id?: string | null;
  is_read: boolean;
  is_archived: boolean;
  action_url?: string; // Tab id or route path to navigate on view
  created_at: string;
}

// Initial mock notifications to make the center immediately beautiful and testable
const INITIAL_MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "New Business Permit Application",
    message: "Jose Rizal Macalinao has submitted a Business Permit clearance application for 'Bohol Divers Beach Resort'.",
    category: "Citizen Applications",
    department_id: "dept-1", // BPLO
    is_read: false,
    is_archived: false,
    action_url: "workflows",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
  },
  {
    id: "notif-2",
    title: "Tax Dispute Assessment Pending",
    message: "A Tax Assessment Dispute query has been routed to your treasury team by Ma. Elena Sanchez.",
    category: "Workflow Updates",
    department_id: "dept-2", // MTO
    is_read: false,
    is_archived: false,
    action_url: "workflows",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
  },
  {
    id: "notif-3",
    title: "New Staff Registration",
    message: "Staff member 'Anna Garcia' registered under the Health Department and is awaiting credential verification.",
    category: "Staff Verification",
    department_id: null, // Global / Admin
    is_read: false,
    is_archived: false,
    action_url: "users",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
  },
  {
    id: "notif-4",
    title: "Press Release Awaiting Approval",
    message: "Mayor's Office drafted a news advisory: 'Seafood Festival 2026' which requires content editor review.",
    category: "News Approval",
    department_id: null,
    is_read: true,
    is_archived: false,
    action_url: "news",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
  },
  {
    id: "notif-5",
    title: "New PDF Ordinance Uploaded",
    message: "Document Library updated with: 'Talibon Local Ordinance No. 14-2026 - Marine Protection Guidelines'.",
    category: "Document Updates",
    department_id: null,
    is_read: false,
    is_archived: false,
    action_url: "downloadables",
    created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString() // 8 hours ago
  },
  {
    id: "notif-6",
    title: "Quarterly Budget Reconciliation",
    message: "Treasury budget allocation files uploaded for review by the Municipal Accountant.",
    category: "Department Announcements",
    department_id: "dept-2", // MTO
    is_read: true,
    is_archived: false,
    action_url: "downloadables",
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString() // 1 day ago
  },
  {
    id: "notif-7",
    title: "Scheduled Cloud Ingress Maintenance",
    message: "The CMS data portal will undergo minor routing updates on Sunday at 2:00 AM PST.",
    category: "System Messages",
    department_id: null,
    is_read: false,
    is_archived: false,
    action_url: "overview",
    created_at: new Date(Date.now() - 1000 * 60 * 2880).toISOString() // 2 days ago
  }
];

// Helper to load fallback local state
const getLocalNotifications = (): AppNotification[] => {
  const saved = localStorage.getItem("talibon_notifications");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("[NotificationService] Parse error loading notifications:", e);
    }
  }
  localStorage.setItem("talibon_notifications", JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
  return INITIAL_MOCK_NOTIFICATIONS;
};

// Helper to save fallback local state
const saveLocalNotifications = (notifs: AppNotification[]) => {
  localStorage.setItem("talibon_notifications", JSON.stringify(notifs));
};

export const notificationService = {
  /**
   * Fetches notifications matching the profile's department and role authorization level
   */
  async getNotifications(profile: UserProfile | null): Promise<AppNotification[]> {
    if (!profile) return [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        // Department filtering (unless super_admin or admin which see everything)
        const isGeneralAdmin = ["super_admin", "admin"].includes(profile.role);
        if (!isGeneralAdmin) {
          // Filter dynamically: matching department, or targeted directly to user, or global (department_id is null)
          if (profile.department_id) {
            query = query.or(`department_id.eq.${profile.department_id},department_id.is.null,user_id.eq.${profile.id}`);
          } else {
            query = query.or(`department_id.is.null,user_id.eq.${profile.id}`);
          }
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as AppNotification[];
        } else if (error) {
          console.warn("[NotificationService] Supabase load failed, falling back:", error.message);
        }
      } catch (err) {
        console.warn("[NotificationService] Supabase exception:", err);
      }
    }

    // Dynamic filtering for localStorage local state
    const local = getLocalNotifications();
    const isGeneralAdmin = ["super_admin", "admin"].includes(profile.role);

    const filtered = local.filter((notif) => {
      if (isGeneralAdmin) return true; // Admins see everything
      if (notif.user_id === profile.id) return true; // Direct targeting
      if (!notif.department_id) return true; // Global notification
      return notif.department_id === profile.department_id; // Department matching
    });

    // Return sorted newest first
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
        if (!error) return true;
        console.error("[NotificationService] Error marking as read in Supabase:", error.message);
      } catch (err) {
        console.error("[NotificationService] Exception marking as read:", err);
      }
    }

    // Local fallback
    const local = getLocalNotifications();
    const updated = local.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    saveLocalNotifications(updated);
    return true;
  },

  /**
   * Mark all matching notifications as read
   */
  async markAllAsRead(profile: UserProfile | null): Promise<boolean> {
    if (!profile) return false;

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("is_read", false);

        const isGeneralAdmin = ["super_admin", "admin"].includes(profile.role);
        if (!isGeneralAdmin) {
          if (profile.department_id) {
            query = query.or(`department_id.eq.${profile.department_id},department_id.is.null,user_id.eq.${profile.id}`);
          } else {
            query = query.or(`department_id.is.null,user_id.eq.${profile.id}`);
          }
        }

        const { error } = await query;
        if (!error) return true;
        console.error("[NotificationService] Error marking all as read in Supabase:", error.message);
      } catch (err) {
        console.error("[NotificationService] Exception marking all as read:", err);
      }
    }

    // Local fallback
    const local = getLocalNotifications();
    const isGeneralAdmin = ["super_admin", "admin"].includes(profile.role);
    const updated = local.map((notif) => {
      // Determine if this notification would be visible to this user
      const isVisible =
        isGeneralAdmin ||
        notif.user_id === profile.id ||
        !notif.department_id ||
        notif.department_id === profile.department_id;

      if (isVisible) {
        return { ...notif, is_read: true };
      }
      return notif;
    });

    saveLocalNotifications(updated);
    return true;
  },

  /**
   * Archive a single notification
   */
  async archiveNotification(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_archived: true })
          .eq("id", id);
        if (!error) return true;
        console.error("[NotificationService] Error archiving in Supabase:", error.message);
      } catch (err) {
        console.error("[NotificationService] Exception archiving:", err);
      }
    }

    // Local fallback
    const local = getLocalNotifications();
    const updated = local.map((n) => (n.id === id ? { ...n, is_archived: true } : n));
    saveLocalNotifications(updated);
    return true;
  },

  /**
   * Create a new notification (useful when triggering workflows inside CMS)
   */
  async createNotification(notif: Omit<AppNotification, "id" | "is_read" | "is_archived" | "created_at">): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...notif,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .insert([
            {
              title: newNotif.title,
              message: newNotif.message,
              category: newNotif.category,
              department_id: newNotif.department_id,
              user_id: newNotif.user_id,
              is_read: false,
              is_archived: false,
              action_url: newNotif.action_url
            }
          ])
          .select();

        if (!error && data && data.length > 0) {
          return data[0] as AppNotification;
        } else if (error) {
          console.error("[NotificationService] Error inserting notification into Supabase:", error.message);
        }
      } catch (err) {
        console.error("[NotificationService] Exception inserting notification:", err);
      }
    }

    // Local fallback
    const local = getLocalNotifications();
    const updated = [newNotif, ...local];
    saveLocalNotifications(updated);

    // Also dispatch a window event to notify other components instantly of the update in mock mode
    window.dispatchEvent(new CustomEvent("talibon_notif_added", { detail: newNotif }));

    return newNotif;
  },

  /**
   * Subscribes to live notification updates. Set up for Supabase Realtime PG channel subscription.
   */
  subscribeToNotifications(profile: UserProfile | null, onUpdate: () => void): () => void {
    if (!profile) return () => {};

    let removeRealtimeChannel: (() => void) | null = null;

    // 1. Live Realtime Subscriptions
    if (isSupabaseConfigured) {
      try {
        const uniqueId = Math.random().toString(36).substring(2, 11);
        const channelName = `live-notifications-${uniqueId}`;
        const channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications" },
            () => {
              onUpdate();
            }
          );
        
        channel.subscribe();

        removeRealtimeChannel = () => {
          try {
            supabase.removeChannel(channel);
          } catch (removeErr) {
            console.warn("[NotificationService] Error removing channel:", removeErr);
          }
        };
      } catch (err) {
        console.warn("[NotificationService] Realtime subscription initialization failed, using fallback polling:", err);
      }
    }

    // 2. Fallback mode: Listening to local window trigger events + light interval backup polling
    const handleLocalAdded = () => {
      onUpdate();
    };

    window.addEventListener("talibon_notif_added", handleLocalAdded);
    
    // Interval polling for mock notifications changes (every 10s for responsive in-app sandbox interactions)
    const interval = setInterval(onUpdate, 10000);

    return () => {
      if (removeRealtimeChannel) {
        removeRealtimeChannel();
      }
      window.removeEventListener("talibon_notif_added", handleLocalAdded);
      clearInterval(interval);
    };
  }
};
