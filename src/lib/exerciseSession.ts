// Tiny pub/sub so only one wellness exercise (meditation or breathing) runs at a time.
// When one component claims the session, others receive the new owner and stop themselves.

export type ExerciseSessionType = "meditation" | "breathing";

type Listener = (owner: ExerciseSessionType) => void;

const listeners = new Set<Listener>();
let currentOwner: ExerciseSessionType | null = null;

export const claimExerciseSession = (owner: ExerciseSessionType) => {
  currentOwner = owner;
  listeners.forEach((cb) => cb(owner));
};

export const releaseExerciseSession = (owner: ExerciseSessionType) => {
  if (currentOwner === owner) currentOwner = null;
};

export const subscribeExerciseSession = (cb: Listener) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
