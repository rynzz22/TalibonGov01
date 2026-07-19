import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, NewsItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

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

function getStorageNews(): NewsItem[] {
  const data = localStorage.getItem("cms_data:news");
  if (!data) {
    localStorage.setItem("cms_data:news", JSON.stringify(INITIAL_NEWS));
    return INITIAL_NEWS;
  }
  return JSON.parse(data);
}

function setStorageNews(data: NewsItem[]): void {
  localStorage.setItem("cms_data:news", JSON.stringify(data));
}

export const newsService = {
  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        if (data) return data as NewsItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[NewsService] Failed to load news items: ${e.message}`);
        }
        console.error("[NewsService] Supabase News fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageNews();
  },

  async createNews(item: Omit<NewsItem, "id">, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const initialStatus = item.status === "published" ? "draft" : item.status;
        const insertPayload = { ...item, status: initialStatus };

        const { data, error } = await supabase
          .from("news")
          .insert([insertPayload])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "news", data.id);
          
          if (item.status === "published") {
            try {
              await this.publishNewsRpc(data.id, userEmail);
              return { ...data, status: "published" } as NewsItem;
            } catch (pubErr) {
              console.error("[NewsService] RPC publish failed during create:", pubErr);
            }
          }
          return data as NewsItem;
        }
      } catch (e: any) {
        console.error("[NewsService] Supabase News insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to save news.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as NewsItem;
    const list = getStorageNews();
    list.unshift(newItem);
    setStorageNews(list);
    await logCmsAction(userEmail, "CREATE", "news", id);
    return newItem;
  },

  async updateNews(id: string, item: Partial<NewsItem>, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const shouldPublishViaRpc = item.status === "published";
        const updatePayload = { ...item };
        if (shouldPublishViaRpc) {
          delete updatePayload.status;
        }

        let updatedData: any = null;
        if (Object.keys(updatePayload).length > 0) {
          const { data, error } = await supabase
            .from("news")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .maybeSingle();
          if (error) throw error;
          updatedData = data;
        }

        if (shouldPublishViaRpc) {
          await this.publishNewsRpc(id, userEmail);
          if (!updatedData) {
            const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
            updatedData = data;
          } else {
            updatedData.status = "published";
          }
        }

        if (updatedData) {
          await logCmsAction(userEmail, "UPDATE", "news", id);
          return updatedData as NewsItem;
        }
      } catch (e: any) {
        console.error("[NewsService] Supabase News update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to update news.");
    }

    const list = getStorageNews();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageNews(list);
      await logCmsAction(userEmail, "UPDATE", "news", id);
      return list[index];
    }
    throw new Error("News item not found");
  },

  async deleteNews(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("news")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "news", id);
        return true;
      } catch (e: any) {
        console.error("[NewsService] Supabase News delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to delete news.");
    }

    const list = getStorageNews();
    const filtered = list.filter(n => n.id !== id);
    setStorageNews(filtered);
    await logCmsAction(userEmail, "DELETE", "news", id);
    return true;
  },

  /**
   * Publish news using the publish_news RPC
   */
  async publishNewsRpc(newsId: string, userEmail: string): Promise<any> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc("publish_news", {
          p_news_id: newsId,
        });
        if (error) throw error;
        await logCmsAction(userEmail, "PUBLISH_RPC", "news", newsId);
        return data;
      } catch (e: any) {
        console.error("[NewsService] publish_news RPC call failed, trying standard update:", e.message || e);
        // Fallback to standard update in case RPC is not loaded/fails
        return this.updateNews(newsId, { status: "published" }, userEmail);
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to call RPC.");
    }
    return this.updateNews(newsId, { status: "published" }, userEmail);
  }
};
