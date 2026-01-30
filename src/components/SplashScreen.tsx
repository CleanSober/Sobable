import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

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

  const handleAnimationComplete = () => {
    if (!isVisible) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--secondary)))" }}
            />
          </div>

          {/* Logo container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon with glow effect */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative mb-6"
            >
              {/* Glow ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 rounded-3xl blur-xl"
                style={{ 
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5))",
                  transform: "scale(1.3)"
                }}
              />
              
              {/* Main icon container */}
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-0.5 shadow-2xl">
                <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-14 h-14 text-primary" fill="currentColor" />
                </div>
              </div>

              {/* Sparkle decorations */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-accent" />
              </motion.div>
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-3xl font-bold text-foreground tracking-tight mb-2"
            >
              Clean & Sober
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-muted-foreground text-sm font-medium"
            >
              Your journey to recovery
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute bottom-20 flex flex-col items-center gap-3"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
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
