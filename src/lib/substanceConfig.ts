// Central substance/addiction configuration with personalized wording

export interface SubstanceOption {
  id: string;
  label: string;
  emoji: string;
  category: "substance" | "behavioral";
}

export const SUBSTANCE_OPTIONS: SubstanceOption[] = [
  // Substances
  { id: "alcohol", label: "Alcohol", emoji: "🍺", category: "substance" },
  { id: "nicotine", label: "Nicotine", emoji: "🚬", category: "substance" },
  { id: "cannabis", label: "Cannabis", emoji: "🌿", category: "substance" },
  { id: "cocaine", label: "Cocaine", emoji: "❄️", category: "substance" },
  { id: "opioids", label: "Opioids", emoji: "💊", category: "substance" },
  { id: "meth", label: "Meth", emoji: "⚗️", category: "substance" },
  { id: "prescription", label: "Prescription Drugs", emoji: "💉", category: "substance" },
  { id: "benzos", label: "Benzodiazepines", emoji: "🧪", category: "substance" },
  { id: "caffeine", label: "Caffeine", emoji: "☕", category: "substance" },
  { id: "vaping", label: "Vaping", emoji: "💨", category: "substance" },
  // Behavioral
  { id: "gambling", label: "Gambling", emoji: "🎰", category: "behavioral" },
  { id: "porn", label: "Pornography", emoji: "🔞", category: "behavioral" },
  { id: "social_media", label: "Social Media", emoji: "📱", category: "behavioral" },
  { id: "gaming", label: "Gaming", emoji: "🎮", category: "behavioral" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", category: "behavioral" },
  { id: "sugar", label: "Sugar / Junk Food", emoji: "🍩", category: "behavioral" },
  { id: "other", label: "Other", emoji: "🔄", category: "behavioral" },
];

// Personalized wording based on user's selected substances
interface PersonalizedWording {
  /** e.g. "sober", "clean", "free" */
  statusWord: string;
  /** e.g. "sobriety", "recovery", "freedom" */
  journeyWord: string;
  /** e.g. "Days Sober", "Days Clean", "Days Free" */
  counterLabel: string;
  /** e.g. "Clean Since", "Sober Since", "Free Since" */
  sinceLabel: string;
  /** e.g. "your substance", "alcohol", "gambling" */
  substanceRef: string;
  /** e.g. "drinking", "using", "gambling" */
  actionWord: string;
  /** e.g. "substance costs", "alcohol costs", "gambling losses" */
  spendingLabel: string;
}

const SUBSTANCE_WORDING: Record<string, Partial<PersonalizedWording>> = {
  alcohol: { statusWord: "sober", journeyWord: "sobriety", counterLabel: "Days Sober", sinceLabel: "Sober Since", substanceRef: "alcohol", actionWord: "drinking", spendingLabel: "alcohol costs" },
  nicotine: { statusWord: "smoke-free", journeyWord: "freedom", counterLabel: "Days Smoke-Free", sinceLabel: "Quit Since", substanceRef: "nicotine", actionWord: "smoking", spendingLabel: "cigarette/vape costs" },
  vaping: { statusWord: "vape-free", journeyWord: "freedom", counterLabel: "Days Vape-Free", sinceLabel: "Quit Since", substanceRef: "vaping", actionWord: "vaping", spendingLabel: "vape costs" },
  cannabis: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "cannabis", actionWord: "using", spendingLabel: "cannabis costs" },
  cocaine: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "cocaine", actionWord: "using", spendingLabel: "substance costs" },
  opioids: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "opioids", actionWord: "using", spendingLabel: "substance costs" },
  meth: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "meth", actionWord: "using", spendingLabel: "substance costs" },
  prescription: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "prescription drugs", actionWord: "using", spendingLabel: "substance costs" },
  benzos: { statusWord: "clean", journeyWord: "recovery", counterLabel: "Days Clean", sinceLabel: "Clean Since", substanceRef: "benzodiazepines", actionWord: "using", spendingLabel: "substance costs" },
  caffeine: { statusWord: "caffeine-free", journeyWord: "freedom", counterLabel: "Days Caffeine-Free", sinceLabel: "Quit Since", substanceRef: "caffeine", actionWord: "consuming caffeine", spendingLabel: "coffee/energy drink costs" },
  gambling: { statusWord: "gamble-free", journeyWord: "recovery", counterLabel: "Days Gamble-Free", sinceLabel: "Free Since", substanceRef: "gambling", actionWord: "gambling", spendingLabel: "gambling losses" },
  porn: { statusWord: "free", journeyWord: "freedom", counterLabel: "Days Free", sinceLabel: "Free Since", substanceRef: "pornography", actionWord: "watching", spendingLabel: "subscription costs" },
  social_media: { statusWord: "free", journeyWord: "freedom", counterLabel: "Days Free", sinceLabel: "Free Since", substanceRef: "social media", actionWord: "scrolling", spendingLabel: "time saved" },
  gaming: { statusWord: "free", journeyWord: "recovery", counterLabel: "Days Free", sinceLabel: "Free Since", substanceRef: "gaming", actionWord: "gaming", spendingLabel: "gaming costs" },
  shopping: { statusWord: "free", journeyWord: "recovery", counterLabel: "Days Free", sinceLabel: "Free Since", substanceRef: "compulsive shopping", actionWord: "impulse buying", spendingLabel: "impulse spending" },
  sugar: { statusWord: "free", journeyWord: "freedom", counterLabel: "Days Free", sinceLabel: "Free Since", substanceRef: "sugar/junk food", actionWord: "binging", spendingLabel: "junk food costs" },
};

const DEFAULTS: PersonalizedWording = {
  statusWord: "sober",
  journeyWord: "recovery",
  counterLabel: "Days Sober",
  sinceLabel: "Clean Since",
  substanceRef: "your addiction",
  actionWord: "using",
  spendingLabel: "substance costs",
};

/**
 * Given user's selected substance IDs, returns personalized wording.
 * Prioritizes the first/primary substance for single-word labels.
 */
export function getPersonalizedWording(substances: string[] | null | undefined): PersonalizedWording {
  if (!substances || substances.length === 0) return DEFAULTS;

  const primary = substances[0];
  const config = SUBSTANCE_WORDING[primary];
  if (!config) return DEFAULTS;

  return { ...DEFAULTS, ...config };
}

/**
 * Returns true if user's addictions are purely behavioral (no substances).
 */
export function isBehavioralOnly(substances: string[] | null | undefined): boolean {
  if (!substances || substances.length === 0) return false;
  return substances.every(s => {
    const opt = SUBSTANCE_OPTIONS.find(o => o.id === s);
    return opt?.category === "behavioral";
  });
}
