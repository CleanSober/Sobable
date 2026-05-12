import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import soberClubLogo from "@/assets/sober-club-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({ onComplete, minDisplayTime = 1600 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), minDisplayTime);
    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Fallback in case exit animation doesn't fire
  useEffect(() => {
    if (!isVisible) {
      const fallback = setTimeout(onComplete, 600);
      return () => clearTimeout(fallback);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Static gradient backdrop — no animation, no blur */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 35%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(ellipse at 75% 70%, hsl(var(--accent) / 0.18), transparent 60%)",
            }}
          />

          {/* Logo + text — single fade/scale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative mb-8">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.35), hsl(var(--accent) / 0.28))",
                  transform: "scale(1.2)",
                  filter: "blur(20px)",
                }}
              />
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-elevated tech-border">
                <img
                  src={soberClubLogo}
                  alt="Sobable"
                  className="w-full h-full object-cover"
                  decoding="sync"
                  fetchPriority="high"
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-3 text-gradient">
              Sobable
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Rise. Recover. Renew.
            </p>
          </motion.div>

          {/* Lightweight loading dots — CSS animation, GPU-cheap */}
          <div className="absolute bottom-24 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary/70"
                style={{
                  animation: "splash-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes splash-dot {
              0%, 100% { opacity: 0.35; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.3); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
