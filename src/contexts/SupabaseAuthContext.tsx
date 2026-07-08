import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export type OfficialRole = "municipal_admin" | "barangay_admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: OfficialRole;
  barangay_id?: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error("[Auth] Profile fetch error:", error.message);
        }
        return;
      }

      if (data) setProfile(data as UserProfile);
    } catch (err) {
      console.error("[Auth] refreshProfile error:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile();
      else setProfile(null);
      setLoading(false);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'SUPABASE_AUTH_SUCCESS' &&
        event.source !== null
      ) {
        refreshProfile();
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("[Auth] Google sign-in error:", error.message);
        alert("Login Error: " + error.message);
        return;
      }

      if (data?.url) {
        const popup = window.open(
          data.url,
          'supabase_auth_popup',
          'width=600,height=700,top=100,left=100,noopener,noreferrer'
        );
        if (!popup) {
          alert("Popup blocked. Please allow popups for this site and try again.");
        }
      }
    } catch (err) {
      console.error("[Auth] Unexpected sign-in error:", err);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
