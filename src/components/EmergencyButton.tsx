import { useState, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Phone, Heart, MessageCircle, X, Shield, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/storage";

const POSITION_STORAGE_KEY = 'emergency-button-position';

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const userData = getUserData();
  const dragControls = useDragControls();

  // Load saved position on mount
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

  // Save position when it changes
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPosition);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
    // Small delay to prevent click from firing
    setTimeout(() => setIsDragging(false), 100);
  };

  const resources = [
    {
      name: "SAMHSA Helpline",
      description: "Free, confidential, 24/7 support",
      phone: "1-800-662-4357",
      icon: Phone,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      name: "Crisis Text Line",
      description: "Text HOME to 741741",
      phone: "741741",
      icon: MessageCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
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
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!isDragging) {
            setIsOpen(true);
          }
        }}
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing touch-none"
        aria-label="Emergency Support - Drag to reposition"
        whileDrag={{ scale: 1.1 }}
      >
        <Shield className="w-6 h-6" />
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
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
            >
              <div className="rounded-2xl gradient-card shadow-soft border border-border p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Shield className="w-5 h-5 text-destructive" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Emergency Support
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Personal Reminder */}
                {userData?.personalReminder && (
                  <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">Your Reason</span>
                    </div>
                    <p className="text-foreground">{userData.personalReminder}</p>
                  </div>
                )}

                {/* Resources */}
                <div className="space-y-3 mb-6">
                  {resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={`tel:${resource.phone}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${resource.bgColor}`}>
                        <resource.icon className={`w-5 h-5 ${resource.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">{resource.phone}</span>
                    </a>
                  ))}
                </div>

                {/* Contact buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {userData?.sponsorPhone && (
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
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
                      className="border-accent/30 text-accent hover:bg-accent/10"
                      asChild
                    >
                      <a href={`tel:${userData.emergencyContact}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Emergency Contact
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
