import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sobableIcon from "@/assets/sobable-icon-new.png";

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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(198 88% 58%) 0%, hsl(168 78% 46%) 50%, hsl(152 72% 42%) 100%)",
          }}
        >
          {/* Soft glow wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, hsl(0 0% 100% / 0.18), transparent 65%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative mb-8">
              <div
                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.45), transparent 70%)",
                  transform: "scale(1.45)",
                  filter: "blur(30px)",
                }}
              />
              <div className="relative w-36 h-36 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/30">
                <img
                  src={sobableIcon}
                  alt="Sobable"
                  className="w-full h-full object-cover"
                  decoding="sync"
                  fetchPriority="high"
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-3 text-white drop-shadow-lg">
              Sobable
            </h1>
            <p className="text-white/85 text-base font-medium">
              Rise. Recover. Renew.
            </p>
          </motion.div>

          <div className="absolute bottom-24 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-white/80"
                style={{
                  animation: "splash-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes splash-dot {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.3); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
