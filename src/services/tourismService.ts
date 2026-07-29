import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, TourismSpotItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";
import { apiCache } from "../lib/apiCache";
import { logServiceEvent } from "../lib/logger";

const CACHE_KEY = "tourism_spots:list";
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes for static tourism content

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

function getStorageTourism(): TourismSpotItem[] {
  const data = localStorage.getItem("cms_data:tourism_spots");
  if (!data) {
    localStorage.setItem("cms_data:tourism_spots", JSON.stringify(INITIAL_TOURISM));
    return INITIAL_TOURISM;
  }
  return JSON.parse(data);
}

function setStorageTourism(data: TourismSpotItem[]): void {
  localStorage.setItem("cms_data:tourism_spots", JSON.stringify(data));
}

export const tourismService = {
  async getTourismSpots(): Promise<TourismSpotItem[]> {
    const cached = apiCache.get<TourismSpotItem[]>(CACHE_KEY);
    if (cached) return cached.data;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .select("id, name, description, gallery_images, location, google_maps_link, opening_hours, contact_details, featured_image, created_at")
          .order("name", { ascending: true })
          .limit(100);
        if (error) throw error;
        if (data) {
          const result = data as TourismSpotItem[];
          apiCache.set(CACHE_KEY, result, CACHE_TTL_MS, ["tourism"]);
          return result;
        }
      } catch (e: any) {
        logServiceEvent("TourismService", "getTourismSpots", "error", "Fetch failed", { error: e.message });
        if (!isMockAllowed()) {
          throw new Error(`[TourismService] Failed to load tourism spots: ${e.message}`);
        }
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    const fallback = getStorageTourism();
    apiCache.set(CACHE_KEY, fallback, CACHE_TTL_MS, ["tourism"], "FALLBACK");
    return fallback;
  },

  async getDelicacies(): Promise<TourismSpotItem[]> {
    const spots = await this.getTourismSpots();
    const delicacies = spots.filter(s =>
      (s.description && (s.description.toLowerCase().includes("delicacy") || s.description.toLowerCase().includes("food") || s.description.toLowerCase().includes("calamay") || s.description.toLowerCase().includes("seafood"))) ||
      (s.name && (s.name.toLowerCase().includes("delicacy") || s.name.toLowerCase().includes("calamay") || s.name.toLowerCase().includes("seafood") || s.name.toLowerCase().includes("crab")))
    );
    return delicacies.length > 0 ? delicacies : spots;
  },

  async createTourismSpot(item: Omit<TourismSpotItem, "id">, userEmail: string): Promise<TourismSpotItem> {
    apiCache.invalidateTag("tourism");
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "tourism_spots", data.id);
          logServiceEvent("TourismService", "createTourismSpot", "info", "Created tourism spot", { id: data.id });
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        logServiceEvent("TourismService", "createTourismSpot", "error", "Insert failed", { error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to save data.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as TourismSpotItem;
    const list = getStorageTourism();
    list.unshift(newItem);
    setStorageTourism(list);
    await logCmsAction(userEmail, "CREATE", "tourism_spots", id);
    return newItem;
  },

  async updateTourismSpot(id: string, item: Partial<TourismSpotItem>, userEmail: string): Promise<TourismSpotItem> {
    apiCache.invalidateTag("tourism");
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
          logServiceEvent("TourismService", "updateTourismSpot", "info", "Updated tourism spot", { id });
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        logServiceEvent("TourismService", "updateTourismSpot", "error", "Update failed", { id, error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageTourism();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageTourism(list);
      await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
      return list[index];
    }
    throw new Error("Tourism spot not found");
  },

  async deleteTourismSpot(id: string, userEmail: string): Promise<boolean> {
    apiCache.invalidateTag("tourism");
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("tourism_spots")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
        logServiceEvent("TourismService", "deleteTourismSpot", "info", "Deleted tourism spot", { id });
        return true;
      } catch (e: any) {
        logServiceEvent("TourismService", "deleteTourismSpot", "error", "Delete failed", { id, error: e.message });
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageTourism();
    const filtered = list.filter(n => n.id !== id);
    setStorageTourism(filtered);
    await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
    return true;
  }
};

