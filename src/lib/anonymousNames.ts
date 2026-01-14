// Adjectives and nouns for generating anonymous names
const adjectives = [
  "Brave", "Calm", "Hopeful", "Strong", "Gentle", 
  "Kind", "Peaceful", "Radiant", "Steady", "Wise",
  "Bright", "Serene", "Resilient", "Grateful", "Joyful",
  "Courageous", "Mindful", "Patient", "Caring", "Humble",
  "Fearless", "Tranquil", "Vibrant", "Spirited", "Noble"
];

const nouns = [
  "Phoenix", "Butterfly", "Eagle", "Dolphin", "Lion",
  "Oak", "River", "Star", "Mountain", "Sunrise",
  "Falcon", "Wolf", "Bear", "Hawk", "Lotus",
  "Cedar", "Ocean", "Moon", "Summit", "Dawn",
  "Tiger", "Owl", "Fox", "Raven", "Maple"
];

/**
 * Generates a consistent anonymous name based on a user ID
 * The same user ID will always generate the same name
 */
export const generateAnonymousName = (userId: string): string => {
  // Create a simple hash from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value to avoid negative indices
  const positiveHash = Math.abs(hash);
  
  const adjIndex = positiveHash % adjectives.length;
  const nounIndex = Math.floor(positiveHash / adjectives.length) % nouns.length;
  const number = (positiveHash % 99) + 1;
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
};

/**
 * Gets display name or generates an anonymous one
 */
export const getDisplayName = (displayName: string | null | undefined, userId: string): string => {
  if (displayName && displayName.trim()) {
    return displayName;
  }
  return generateAnonymousName(userId);
};

/**
 * Gets initials from a display name (for avatars)
 */
export const getInitials = (name: string): string => {
  const words = name.split(/(?=[A-Z])|[\s-]/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Generates a consistent color based on user ID (for avatars)
 */
export const getAvatarColor = (userId: string): string => {
  const colors = [
    "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500",
    "bg-violet-500", "bg-indigo-500", "bg-blue-500", "bg-sky-500",
    "bg-cyan-500", "bg-teal-500", "bg-emerald-500", "bg-green-500",
    "bg-lime-500", "bg-yellow-500", "bg-amber-500", "bg-orange-500"
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
};
