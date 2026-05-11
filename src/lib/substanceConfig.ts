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
  const base = config ? { ...DEFAULTS, ...config } : { ...DEFAULTS };

  // Append substance names: "Days Clean from Cocaine & Alcohol"
  const names = formatSubstanceList(substances);
  if (names) {
    base.counterLabel = `Days ${capitalize(base.statusWord)} from ${names}`;
    base.sinceLabel = `${capitalize(base.statusWord)} from ${names} Since`;
    base.substanceRef = names.toLowerCase();
  }

  return base;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Formats selected substance IDs into a readable list,
 * e.g. ["cocaine", "alcohol"] -> "Cocaine & Alcohol"
 */
export function formatSubstanceList(substances: string[] | null | undefined): string {
  if (!substances || substances.length === 0) return "";
  const labels = substances
    .map(id => SUBSTANCE_OPTIONS.find(o => o.id === id)?.label)
    .filter((x): x is string => Boolean(x) && x !== "Other");
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]}`;
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

// ---------------------------------------------------------------------------
// Personalized affirmations by substance/behavior
// ---------------------------------------------------------------------------

const GENERAL_AFFIRMATIONS = [
  "I am stronger than my cravings.",
  "Every day I choose recovery, I choose myself.",
  "My past does not define my future.",
  "Progress, not perfection, is my goal.",
  "I am worthy of love, including my own.",
  "I am building a life I don't need to escape from.",
  "Each moment of discomfort is temporary; my growth is permanent.",
  "I trust myself to handle whatever comes my way.",
  "I am proud of how far I've come.",
  "Today I choose to be present and grateful.",
  "I release what I cannot control and focus on what I can.",
  "I am more than my addiction — I am resilient.",
  "Every challenge I overcome makes me stronger.",
];

const SUBSTANCE_AFFIRMATIONS: Record<string, string[]> = {
  alcohol: [
    "I don't need a drink to enjoy this moment.",
    "My clarity is more valuable than any buzz.",
    "Every sober morning is a gift I gave myself.",
    "I am rewriting my story without alcohol.",
    "Cravings pass. My sobriety stays.",
  ],
  nicotine: [
    "Each breath I take is mine — clean and free.",
    "I don't need a cigarette to handle this feeling.",
    "My lungs are healing with every smoke-free hour.",
    "I am stronger than the urge to light up.",
    "Freedom from nicotine is freedom for my future.",
  ],
  vaping: [
    "I don't need a vape to feel calm.",
    "My breath belongs to me, not a device.",
    "Every vape-free hour is a victory.",
    "I am breaking the loop, one urge at a time.",
  ],
  cannabis: [
    "I can face today clearly and capably.",
    "My motivation returns a little more each clean day.",
    "I don't need to numb out to get through this.",
    "Sober me is the real me.",
  ],
  cocaine: [
    "I don't need a high to feel alive.",
    "My energy comes from within, not a substance.",
    "Each clean day rebuilds my brain and my life.",
    "I choose long-term peace over short-term escape.",
  ],
  opioids: [
    "I am healing, one clean day at a time.",
    "My pain is real, and so is my strength to face it.",
    "I don't need pills to be okay.",
    "Recovery is the bravest thing I'll ever do.",
  ],
  meth: [
    "I am reclaiming my body, my mind, and my future.",
    "Each clean day is rewiring me back to myself.",
    "I don't need a high to be worthy.",
    "My recovery is a comeback story in progress.",
  ],
  prescription: [
    "I am learning healthier ways to cope.",
    "I don't need a pill to face this moment.",
    "My healing is happening, even when it's slow.",
    "I trust my body and mind to find balance again.",
  ],
  benzos: [
    "I can sit with discomfort and survive it.",
    "My calm is being rebuilt naturally.",
    "I don't need a pill to feel safe.",
    "Each clean day my nervous system grows stronger.",
  ],
  caffeine: [
    "My energy is steady, not borrowed.",
    "I don't need caffeine to start my day.",
    "I am learning to listen to my body's real signals.",
  ],
  gambling: [
    "The only sure win is not playing today.",
    "I don't need a bet to feel excitement.",
    "My money, my time, and my peace are mine again.",
    "Each gamble-free day rebuilds my life.",
  ],
  porn: [
    "I deserve real connection, not a screen.",
    "I am taking back my attention and my desire.",
    "Each free day reshapes my brain for the better.",
    "I don't need to escape — I need to be present.",
  ],
  social_media: [
    "My real life is more interesting than any feed.",
    "I don't need to scroll to feel okay.",
    "My attention is precious — I choose where it goes.",
    "Quiet moments are not boring; they are mine.",
  ],
  gaming: [
    "I can put it down and live this moment fully.",
    "My time is the most valuable resource I have.",
    "I don't need a screen to feel achievement.",
    "Real life has the best storyline.",
  ],
  shopping: [
    "I am enough without buying anything new.",
    "I don't need to spend to feel better.",
    "My worth is not in my cart.",
    "Every urge I resist is money in my future.",
  ],
  sugar: [
    "I am feeding my body what it truly needs.",
    "I don't need sugar to soothe this feeling.",
    "Each balanced day rebuilds my energy.",
    "My cravings are loud, but I am louder.",
  ],
};

/**
 * Returns a personalized list of affirmations based on the user's selected substances/behaviors.
 * Always includes general affirmations so the pool stays varied.
 */
export function getPersonalizedAffirmations(substances: string[] | null | undefined): string[] {
  if (!substances || substances.length === 0) return GENERAL_AFFIRMATIONS;
  const personalized = substances
    .flatMap(s => SUBSTANCE_AFFIRMATIONS[s] || [])
    .filter(Boolean);
  if (personalized.length === 0) return GENERAL_AFFIRMATIONS;
  // De-dupe and put personalized first so the daily pick is more likely to be relevant.
  return Array.from(new Set([...personalized, ...GENERAL_AFFIRMATIONS]));
}

