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

const STORAGE_KEYS = {
  userData: "cleanSober_userData",
  moodEntries: "cleanSober_moodEntries",
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
