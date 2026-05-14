// Limits confetti animations to once per local day so celebrations stay special.
import { getLocalDateString } from "@/lib/dateUtils";

const KEY = "sober_club_confetti_last_date";

export const canShowConfettiToday = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== getLocalDateString();
  } catch {
    return true;
  }
};

export const markConfettiShown = (): void => {
  try {
    localStorage.setItem(KEY, getLocalDateString());
  } catch {
    /* ignore quota */
  }
};
