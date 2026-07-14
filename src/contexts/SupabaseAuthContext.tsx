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
      const targetUser = u || (await supabase.auth.getUser()).data.user;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
    if (import.meta.env.DEV) {
      console.log("[Auth - DEV] User manually signed out.");
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
