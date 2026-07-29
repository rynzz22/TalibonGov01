import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, EventItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";
import { apiCache } from "../lib/apiCache";
import { logServiceEvent } from "../lib/logger";

const CACHE_KEY = "events:list";
const CACHE_TTL_MS = 1000 * 60 * 3; // 3 minutes TTL for events

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

function getStorageEvents(): EventItem[] {
  const data = localStorage.getItem("cms_data:events");
  if (!data) {
    localStorage.setItem("cms_data:events", JSON.stringify(INITIAL_EVENTS));
    return INITIAL_EVENTS;
  }
  return JSON.parse(data);
}

function setStorageEvents(data: EventItem[]): void {
  localStorage.setItem("cms_data:events", JSON.stringify(data));
}

export const eventService = {
  async getEvents(): Promise<EventItem[]> {
    const cached = apiCache.get<EventItem[]>(CACHE_KEY);
    if (cached) return cached.data;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, description, date, time, venue, banner_image, created_at")
          .order("date", { ascending: true })
          .limit(100);
        if (error) throw error;
        if (data) {
          const result = data as EventItem[];
          apiCache.set(CACHE_KEY, result, CACHE_TTL_MS, ["events"]);
          return result;
        }
      } catch (e: any) {
        logServiceEvent("EventService", "getEvents", "error", "Fetch failed", { error: e.message });
        if (!isMockAllowed()) {
          throw new Error(`[EventService] Failed to load events: ${e.message}`);
        }
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    const fallback = getStorageEvents();
    apiCache.set(CACHE_KEY, fallback, CACHE_TTL_MS, ["events"], "FALLBACK");
    return fallback;
  },

  async createEvent(item: Omit<EventItem, "id">, userEmail: string): Promise<EventItem> {
    apiCache.invalidateTag("events");
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "events", data.id);
          logServiceEvent("EventService", "createEvent", "info", "Created event", { id: data.id });
          return data as EventItem;
        }
      } catch (e: any) {
        logServiceEvent("EventService", "createEvent", "error", "Insert failed", { error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to save events.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as EventItem;
    const list = getStorageEvents();
    list.unshift(newItem);
    setStorageEvents(list);
    await logCmsAction(userEmail, "CREATE", "events", id);
    return newItem;
  },

  async updateEvent(id: string, item: Partial<EventItem>, userEmail: string): Promise<EventItem> {
    apiCache.invalidateTag("events");
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "events", id);
          logServiceEvent("EventService", "updateEvent", "info", "Updated event", { id });
          return data as EventItem;
        }
      } catch (e: any) {
        logServiceEvent("EventService", "updateEvent", "error", "Update failed", { id, error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageEvents();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageEvents(list);
      await logCmsAction(userEmail, "UPDATE", "events", id);
      return list[index];
    }
    throw new Error("Event item not found");
  },

  async deleteEvent(id: string, userEmail: string): Promise<boolean> {
    apiCache.invalidateTag("events");
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "events", id);
        logServiceEvent("EventService", "deleteEvent", "info", "Deleted event", { id });
        return true;
      } catch (e: any) {
        logServiceEvent("EventService", "deleteEvent", "error", "Delete failed", { id, error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageEvents();
    const filtered = list.filter(n => n.id !== id);
    setStorageEvents(filtered);
    await logCmsAction(userEmail, "DELETE", "events", id);
    return true;
  }
};

