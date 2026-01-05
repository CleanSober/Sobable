export interface UserData {
  substances: string[];
  sobrietyStartDate: string;
  dailySpending: number;
  sponsorPhone?: string;
  emergencyContact?: string;
  personalReminder?: string;
  onboardingComplete: boolean;
}

export interface MoodEntry {
  date: string;
  mood: number;
  cravingLevel: number;
  note?: string;
}

export interface TriggerEntry {
  id: string;
  date: string;
  time: string;
  trigger: string;
  situation: string;
  emotion: string;
  intensity: number;
  copingUsed?: string;
  outcome?: "resisted" | "struggled" | "relapsed";
  notes?: string;
}

const STORAGE_KEYS = {
  userData: "cleanSober_userData",
  moodEntries: "cleanSober_moodEntries",
  triggerEntries: "cleanSober_triggerEntries",
};

export const getUserData = (): UserData | null => {
  const data = localStorage.getItem(STORAGE_KEYS.userData);
  return data ? JSON.parse(data) : null;
};

export const saveUserData = (data: UserData): void => {
  localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(data));
};

export const getMoodEntries = (): MoodEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.moodEntries);
  return data ? JSON.parse(data) : [];
};

export const saveMoodEntry = (entry: MoodEntry): void => {
  const entries = getMoodEntries();
  const todayIndex = entries.findIndex((e) => e.date === entry.date);
  if (todayIndex >= 0) {
    entries[todayIndex] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(STORAGE_KEYS.moodEntries, JSON.stringify(entries));
};

export const getTodaysMoodEntry = (): MoodEntry | null => {
  const today = new Date().toISOString().split("T")[0];
  const entries = getMoodEntries();
  return entries.find((e) => e.date === today) || null;
};

// Trigger entries
export const getTriggerEntries = (): TriggerEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.triggerEntries);
  return data ? JSON.parse(data) : [];
};

export const saveTriggerEntry = (entry: TriggerEntry): void => {
  const entries = getTriggerEntries();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.triggerEntries, JSON.stringify(entries));
};

export const deleteTriggerEntry = (id: string): void => {
  const entries = getTriggerEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.triggerEntries, JSON.stringify(entries));
};

// Pattern analysis
export interface PatternAnalysis {
  topTriggers: { name: string; count: number }[];
  topEmotions: { name: string; count: number }[];
  topSituations: { name: string; count: number }[];
  highRiskTimes: { name: string; count: number }[];
  successRate: number;
  totalEntries: number;
}

export const analyzePatterns = (): PatternAnalysis => {
  const entries = getTriggerEntries();
  
  const triggerCounts: Record<string, number> = {};
  const emotionCounts: Record<string, number> = {};
  const situationCounts: Record<string, number> = {};
  const timeCounts: Record<string, number> = {};
  let resistedCount = 0;

  entries.forEach((entry) => {
    triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    situationCounts[entry.situation] = (situationCounts[entry.situation] || 0) + 1;
    
    const hour = parseInt(entry.time.split(":")[0]);
    const timeSlot = hour < 6 ? "Night (12-6am)" : hour < 12 ? "Morning (6am-12pm)" : hour < 18 ? "Afternoon (12-6pm)" : "Evening (6pm-12am)";
    timeCounts[timeSlot] = (timeCounts[timeSlot] || 0) + 1;
    
    if (entry.outcome === "resisted") resistedCount++;
  });

  const sortByCount = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  return {
    topTriggers: sortByCount(triggerCounts),
    topEmotions: sortByCount(emotionCounts),
    topSituations: sortByCount(situationCounts),
    highRiskTimes: sortByCount(timeCounts),
    successRate: entries.length > 0 ? (resistedCount / entries.length) * 100 : 0,
    totalEntries: entries.length,
  };
};

export const calculateDaysSober = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateMoneySaved = (
  startDate: string,
  dailySpending: number
): number => {
  const days = calculateDaysSober(startDate);
  return days * dailySpending;
};

export const getMotivationalQuote = (): { quote: string; author: string } => {
  const quotes = [
    { quote: "Recovery is not for people who need it, it's for people who want it.", author: "Unknown" },
    { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { quote: "Every day is a new opportunity to change your life.", author: "Unknown" },
    { quote: "You are stronger than you think. You have gotten through every bad day so far.", author: "Unknown" },
    { quote: "One day at a time. One step at a time. One breath at a time.", author: "Unknown" },
    { quote: "Progress, not perfection.", author: "Unknown" },
    { quote: "The comeback is always stronger than the setback.", author: "Unknown" },
    { quote: "Your addiction does not define you. Your recovery does.", author: "Unknown" },
    { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { quote: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  ];
  const today = new Date();
  const index = today.getDate() % quotes.length;
  return quotes[index];
};

export const getMilestones = (daysSober: number): { reached: string[]; next: { name: string; days: number } | null } => {
  const milestones = [
    { name: "1 Day", days: 1 },
    { name: "1 Week", days: 7 },
    { name: "2 Weeks", days: 14 },
    { name: "1 Month", days: 30 },
    { name: "2 Months", days: 60 },
    { name: "3 Months", days: 90 },
    { name: "6 Months", days: 180 },
    { name: "9 Months", days: 270 },
    { name: "1 Year", days: 365 },
    { name: "18 Months", days: 548 },
    { name: "2 Years", days: 730 },
    { name: "3 Years", days: 1095 },
    { name: "5 Years", days: 1825 },
  ];

  const reached = milestones.filter((m) => daysSober >= m.days).map((m) => m.name);
  const next = milestones.find((m) => daysSober < m.days) || null;

  return { reached, next };
};

// Coping strategies based on triggers/emotions
export const getCopingStrategies = (emotion: string, trigger: string): string[] => {
  const strategies: Record<string, string[]> = {
    stress: [
      "Take 5 deep breaths",
      "Go for a short walk",
      "Call your sponsor or support person",
      "Practice the 5-4-3-2-1 grounding technique",
    ],
    anxiety: [
      "Use box breathing (4-4-4-4)",
      "Write down your worries",
      "Listen to calming music",
      "Do a body scan meditation",
    ],
    boredom: [
      "Start a new hobby project",
      "Exercise or stretch",
      "Call a friend",
      "Read or listen to a podcast",
    ],
    loneliness: [
      "Reach out to a friend or family member",
      "Attend a support group meeting",
      "Journal your feelings",
      "Practice self-compassion",
    ],
    anger: [
      "Remove yourself from the situation",
      "Count to 10 slowly",
      "Physical exercise to release tension",
      "Write an unsent letter",
    ],
    sadness: [
      "Allow yourself to feel the emotion",
      "Talk to someone you trust",
      "Do something kind for yourself",
      "Remember: this feeling is temporary",
    ],
    celebration: [
      "Find alcohol-free celebration alternatives",
      "Reward yourself with something healthy",
      "Share your joy with sober friends",
      "Take photos to remember the moment",
    ],
    default: [
      "Use the HALT check: Hungry, Angry, Lonely, Tired?",
      "Play the tape forward - think about tomorrow",
      "Call your emergency contact",
      "Remember your 'why'",
    ],
  };

  return strategies[emotion.toLowerCase()] || strategies.default;
};
