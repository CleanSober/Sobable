import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import sobableLogo from "@/assets/sobable-logo.png";

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
          {/* Background gradient mesh */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Teal primary orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.35, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px]"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--success)))" }}
            />
            {/* Amber accent orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.25, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--warning)))" }}
            />
            {/* Subtle center glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px]"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)" }}
            />
          </div>

          {/* Logo container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 180,
              damping: 18
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon with premium glow effect */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="absolute inset-0 rounded-3xl"
                style={{ 
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.4))",
                  transform: "scale(1.4)",
                  filter: "blur(30px)"
                }}
              />
              
              {/* Inner glow ring */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-3xl"
                style={{ 
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.3))",
                  transform: "scale(1.2)",
                  filter: "blur(15px)"
                }}
              />
              
              {/* Main icon container with tech border */}
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-elevated tech-border">
                <img 
                  src={sobableLogo} 
                  alt="Sobable" 
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
            </motion.div>

            {/* App name with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-4xl font-bold tracking-tight mb-3 text-gradient"
            >
              Sobable
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-muted-foreground text-base font-medium"
            >
              Rise. Recover. Renew.
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
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
