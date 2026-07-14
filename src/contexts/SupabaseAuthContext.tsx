import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, Session, AuthResponse } from "@supabase/supabase-js";

export type OfficialRole = "super_admin" | "admin" | "editor" | "municipal_admin" | "barangay_admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: OfficialRole;
  barangay_id?: string | null;
  department_id?: string | null;
  is_verified: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshProfile: (u?: User) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (u?: User) => {
    try {
      let targetUser = u;
      if (!targetUser) {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("[Auth] getUser failed during profile refresh:", error.message);
          if (error.message.includes("Refresh Token") || error.message.includes("not found") || error.message.includes("invalid")) {
            setProfile(null);
            setUser(null);
            setSession(null);
            supabase.auth.signOut().catch(() => {});
            return;
          }
        }
        targetUser = data?.user ?? null;
      }

      if (!targetUser) {
        setProfile(null);
        if (import.meta.env.DEV) {
          console.log("[Auth - DEV] No user found during refreshProfile. Clearing profile state.");
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUser.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error("[Auth] Profile fetch error:", error.message);
        }
        setProfile(null);
        if (import.meta.env.DEV) {
          console.warn(`[Auth - DEV] Profile database load failed for ${targetUser.email} with code ${error.code}: ${error.message}`);
        }
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] User Profile Loaded: ${data.full_name || data.email}`);
          console.log(`[Auth - DEV] Role Loaded: ${data.role} (Verified: ${data.is_verified})`);
        }
      } else {
        setProfile(null);
        if (import.meta.env.DEV) {
          console.warn(`[Auth - DEV] No profile found in 'profiles' table for user: ${targetUser.email}`);
        }
      }
    } catch (err) {
      console.error("[Auth] refreshProfile error:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn("[Auth - DEV] Error getting session on init:", error.message);
        if (error.message.includes("Refresh Token") || error.message.includes("invalid") || error.message.includes("not found")) {
          // Clean invalid state
          supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        if (import.meta.env.DEV) {
          console.log("[Auth - DEV] Session restored successfully for:", currentUser.email);
        }
        refreshProfile(currentUser).finally(() => setLoading(false));
      } else {
        if (import.meta.env.DEV) {
          console.log("[Auth - DEV] No initial session found. User is guest.");
        }
        setLoading(false);
      }
    }).catch((err) => {
      console.error("[Auth] Fatal error on initial getSession():", err);
      setLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (import.meta.env.DEV) {
        console.log(`[Auth - DEV] Auth state change event occurred: ${event} for ${currentUser?.email || "No User"}`);
      }
      
      if (currentUser) {
        await refreshProfile(currentUser);
      } else {
        setProfile(null);
        if (event === "SIGNED_OUT" && import.meta.env.DEV) {
          console.log("[Auth - DEV] Session expired or user signed out successfully.");
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (res.error) {
        if (import.meta.env.DEV) {
          console.error(`[Auth - DEV] Login Failure for ${email}:`, res.error.message);
        }
      } else if (res.data?.user) {
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] Login Success for ${email}`);
        }
      }
      return res;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error(`[Auth - DEV] Sign-in error exception:`, err.message || err);
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await supabase.auth.signUp({
        email,
        password,
      });

      if (res.error) {
        if (import.meta.env.DEV) {
          console.error(`[Auth - DEV] Registration Failure for ${email}:`, res.error.message);
        }
      } else if (res.data?.user) {
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] Registration Success for ${email}`);
        }
      }
      return res;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error(`[Auth - DEV] Sign-up error exception:`, err.message || err);
      }
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // 1. Manually clear any local storage auth tokens immediately
      // This ensures that even if the API call below fails, the client-side session is gone.
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase.auth.token") || key.includes("auth-token"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase.auth.token") || key.includes("auth-token"))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));

      // 2. Call supabase signOut
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] Warning during supabase.auth.signOut():", err);
    } finally {
      // 3. Reset all React states
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      if (import.meta.env.DEV) {
        console.log("[Auth - DEV] User manually signed out.");
      }
      // 4. Forcefully redirect to /login to clear page state and memory
      window.location.href = "/login";
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({
      password,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
