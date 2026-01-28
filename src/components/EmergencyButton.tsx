import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Heart, MessageCircle, X, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/storage";

const POSITION_STORAGE_KEY = 'emergency-button-position';

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const userData = getUserData();

  useEffect(() => {
    const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved position');
      }
    }
  }, []);

  const triggerHaptic = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPosition);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleButtonClick = () => {
    if (!isDragging) {
      triggerHaptic([50, 30, 50]);
      setIsOpen(true);
    }
  };

  const handleDragStart = () => {
    triggerHaptic(30);
    setIsDragging(true);
  };

  const resources = [
    {
      name: "SAMHSA Helpline",
      description: "Free, confidential, 24/7 support",
      phone: "1-800-662-4357",
      icon: Phone,
    },
    {
      name: "Crisis Text Line",
      description: "Text HOME to 741741",
      phone: "741741",
      icon: MessageCircle,
    },
  ];

  return (
    <>
      {/* Floating Emergency Button */}
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          top: -window.innerHeight + 100,
          left: -window.innerWidth + 100,
          right: 0,
          bottom: 0,
        }}
        initial={{ scale: 0, x: position.x, y: position.y }}
        animate={{ scale: 1, x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleButtonClick}
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, hsl(0 75% 55%), hsl(350 80% 50%))",
          boxShadow: "0 8px 32px hsl(0 75% 55% / 0.4), 0 0 0 1px hsl(0 75% 60% / 0.3)"
        }}
        aria-label="Emergency Support - Drag to reposition"
        whileDrag={{ scale: 1.1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Shield className="w-6 h-6 text-white" />
        
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-white/30"
        />
      </motion.button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
            >
              <div className="card-enhanced p-6 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-destructive/20 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-destructive/15 border border-destructive/25">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      Emergency Support
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Personal Reminder */}
                {userData?.personalReminder && (
                  <div className="mb-6 p-4 rounded-xl glass-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-accent">Your Reason</span>
                    </div>
                    <p className="text-foreground font-medium">{userData.personalReminder}</p>
                  </div>
                )}

                {/* Resources */}
                <div className="space-y-3 mb-6">
                  {resources.map((resource, index) => (
                    <motion.a
                      key={resource.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      href={`tel:${resource.phone}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 group"
                    >
                      <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 group-hover:bg-primary/20 transition-colors">
                        <resource.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{resource.phone}</span>
                    </motion.a>
                  ))}
                </div>

                {/* Contact buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {userData?.sponsorPhone && (
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 h-12"
                      asChild
                    >
                      <a href={`tel:${userData.sponsorPhone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Sponsor
                      </a>
                    </Button>
                  )}
                  {userData?.emergencyContact && (
                    <Button
                      variant="outline"
                      className="border-accent/30 text-accent hover:bg-accent/10 h-12"
                      asChild
                    >
                      <a href={`tel:${userData.emergencyContact}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Emergency
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
