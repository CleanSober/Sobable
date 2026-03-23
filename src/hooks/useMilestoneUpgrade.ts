import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface MilestonePrompt {
  title: string;
  message: string;
  emoji: string;
}

const MILESTONE_PROMPTS: Record<string, MilestonePrompt> = {
  streak_3: {
    title: "3-Day Streak! 🔥",
    message: "You're building momentum! Premium members get streak protection so you never lose progress.",
    emoji: "🛡️",
  },
  streak_7: {
    title: "7-Day Streak! 🎯",
    message: "A full week of consistency! Unlock AI-powered insights to understand your patterns even better.",
    emoji: "🧠",
  },
  streak_14: {
    title: "2-Week Warrior! 💪",
    message: "Two weeks strong! Premium members get personalized recovery pathways for long-term success.",
    emoji: "🗺️",
  },
  streak_30: {
    title: "30-Day Legend! 🏆",
    message: "A whole month! You've proven your commitment. Premium tools can help you go even further.",
    emoji: "⭐",
  },
  sober_7: {
    title: "1 Week Sober! 🌟",
    message: "Your first week! Premium's AI Coach can give you personalized guidance for the road ahead.",
    emoji: "🤖",
  },
  sober_30: {
    title: "30 Days Sober! 🎉",
    message: "One month of strength! See detailed analytics and predictions with Premium insights.",
    emoji: "📊",
  },
  sober_90: {
    title: "90 Days Sober! 🏅",
    message: "A quarter year of freedom! Premium's accountability partner can help you maintain this streak.",
    emoji: "🤝",
  },
  first_journal: {
    title: "First Journal Entry! 📝",
    message: "Great start! Premium unlocks AI-powered mood analysis to find patterns in your journal.",
    emoji: "✨",
  },
  first_trigger: {
    title: "First Trigger Logged! 🎯",
    message: "Self-awareness is key! Premium's pattern analysis can predict and prevent future triggers.",
    emoji: "🔮",
  },
  first_mood: {
    title: "First Mood Check-In! 💚",
    message: "Tracking your feelings is powerful! Premium gives you deep mood trend analytics.",
    emoji: "📈",
  },
};

const STORAGE_KEY = "sobable_milestone_prompts_shown";

export const useMilestoneUpgrade = () => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [pendingPrompt, setPendingPrompt] = useState<MilestonePrompt | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const getShownMilestones = useCallback((): Set<string> => {
    if (!user) return new Set();
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }, [user]);

  const markShown = useCallback((key: string) => {
    if (!user) return;
    const shown = getShownMilestones();
    shown.add(key);
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify([...shown]));
  }, [user, getShownMilestones]);

  const triggerMilestone = useCallback((key: string) => {
    if (isPremium || !user) return;
    const shown = getShownMilestones();
    if (shown.has(key)) return;
    
    const prompt = MILESTONE_PROMPTS[key];
    if (!prompt) return;

    markShown(key);
    // Small delay so it doesn't compete with other toasts
    setTimeout(() => setPendingPrompt(prompt), 1500);
  }, [isPremium, user, getShownMilestones, markShown]);

  const dismissPrompt = useCallback(() => {
    setPendingPrompt(null);
  }, []);

  const upgradeFromPrompt = useCallback(() => {
    setPendingPrompt(null);
    setShowPricing(true);
  }, []);

  return {
    pendingPrompt,
    showPricing,
    setShowPricing,
    triggerMilestone,
    dismissPrompt,
    upgradeFromPrompt,
  };
};
