import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";

export const FRAUNCES = loadFraunces("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const OUTFIT = loadOutfit("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const COLOR = {
  bg: "#070B12",
  bgWarm: "#0E1622",
  teal: "#2DD4A8",
  tealDeep: "#0E7C66",
  gold: "#F5B82E",
  goldSoft: "#FCD37A",
  ink: "#F5F0E6",
  muted: "#7C8694",
};
