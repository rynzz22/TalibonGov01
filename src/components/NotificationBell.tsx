import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { Bell } from "lucide-react";
import { useAuth } from "../contexts/SupabaseAuthContext";
import { notificationService } from "../services/notificationService";

interface NotificationBellProps {
  onClick: () => void;
  refreshTrigger?: number; // Allows parent components to force refresh the bell count
}

export default function NotificationBell({ onClick, refreshTrigger = 0 }: NotificationBellProps) {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const controls = useAnimation();

  const fetchUnreadCount = async () => {
    if (!profile) return;
    try {
      const notifs = await notificationService.getNotifications(profile);
      const unreads = notifs.filter((n) => !n.is_read && !n.is_archived).length;
      
      // If unread count increases, play a cheerful jiggle notification animation
      if (unreads > unreadCount) {
        controls.start({
          rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
          transition: { duration: 0.6, ease: "easeInOut" }
        });
      }
      setUnreadCount(unreads);
    } catch (err) {
      console.error("[NotificationBell] Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchUnreadCount();
    }
  }, [profile, refreshTrigger]);

  useEffect(() => {
    if (!profile) return;

    // Listen to real-time additions or mutations
    const unsubscribe = notificationService.subscribeToNotifications(profile, () => {
      fetchUnreadCount();
    });

    return () => unsubscribe();
  }, [profile, unreadCount, controls]);

  if (!profile) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-brand-text hover:text-brand-accent transition-colors hover:scale-105 active:scale-95 duration-200"
      title="Notification Center"
      aria-label={`Notification Center, ${unreadCount} unread items`}
    >
      <motion.div animate={controls}>
        <Bell size={18} className="stroke-[2.5]" />
      </motion.div>

      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-red-600 border border-white text-white text-[8px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-red-500/35"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </motion.span>
      )}
    </button>
  );
}
