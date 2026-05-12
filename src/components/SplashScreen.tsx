import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import soberClubLogo from "@/assets/sober-club-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({ onComplete, minDisplayTime = 2000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Fallback: if exit animation doesn't fire onExitComplete, force complete after extra delay
  useEffect(() => {
    if (!isVisible) {
      const fallback = setTimeout(() => {
        onComplete();
      }, 800); // exit animation is 500ms, so 800ms is safe
      return () => clearTimeout(fallback);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Background gradient mesh - static for smooth performance */}
          <div
            className="absolute inset-0 opacity-90 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 35%, hsl(var(--primary) / 0.28), transparent 60%), radial-gradient(ellipse at 75% 70%, hsl(var(--accent) / 0.22), transparent 60%)",
              willChange: "opacity",
            }}
          />

          {/* Logo container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ willChange: "transform, opacity" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon with premium glow effect */}
            <div className="relative mb-8">
              {/* Soft static glow (cheap) */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.45), hsl(var(--accent) / 0.35))",
                  transform: "scale(1.25)",
                  filter: "blur(24px)",
                }}
              />
              {/* Main icon container with tech border */}
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-elevated tech-border">
                <img 
                  src={soberClubLogo} 
                  alt="Sober Club" 
                  className="w-full h-full object-cover"
                />
                {/* Shimmer overlay */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.8,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </div>

              {/* Sparkle decorations */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-accent drop-shadow-lg" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
                className="absolute -bottom-1 -left-1"
              >
                <Sparkles className="w-4 h-4 text-primary drop-shadow-lg" />
              </motion.div>
            </div>

            {/* App name with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-4xl font-bold tracking-tight mb-3 text-gradient"
            >
              Sobable
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="text-muted-foreground text-base font-medium"
            >
              Rise. Recover. Renew.
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="absolute bottom-24 flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ 
                    background: i === 1 
                      ? "hsl(var(--accent))" 
                      : "hsl(var(--primary))" 
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
