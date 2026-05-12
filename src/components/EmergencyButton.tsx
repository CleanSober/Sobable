import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Heart, MessageCircle, X, Shield, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserData } from "@/hooks/useUserData";
import { makePhoneCall, sendSMS, hapticWarning, hapticImpact } from "@/lib/nativeActions";

const POSITION_STORAGE_KEY = 'emergency-button-position';
const LAST_CONTACT_STORAGE_KEY = 'emergency-last-contact';

type ContactKind = "call" | "text";
type LastContact = {
  name: string;
  description: string;
  value: string; // phone number or "BODY to NUMBER" for SMS
  kind: ContactKind;
};

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastContact, setLastContact] = useState<LastContact | null>(null);
  const [pendingContact, setPendingContact] = useState<LastContact | null>(null);
  const { profile } = useUserData();

  useEffect(() => {
    const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved position');
      }
    }
    const savedLast = localStorage.getItem(LAST_CONTACT_STORAGE_KEY);
    if (savedLast) {
      try {
        setLastContact(JSON.parse(savedLast));
      } catch (e) {
        console.error('Failed to parse last contact');
      }
    }
  }, []);

  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPosition);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleButtonClick = async () => {
    if (!isDragging) {
      await hapticWarning();
      setIsOpen(true);
    }
  };

  const handleDragStart = async () => {
    await hapticImpact();
    setIsDragging(true);
  };

  const requestContact = (contact: LastContact) => {
    setPendingContact(contact);
  };

  const confirmContact = async () => {
    if (!pendingContact) return;
    const contact = pendingContact;
    setPendingContact(null);

    if (contact.kind === "call") {
      await makePhoneCall(contact.value);
    } else {
      const number = contact.value.includes(" to ")
        ? contact.value.split(" to ")[1]
        : contact.value;
      const body = contact.value.includes(" to ")
        ? contact.value.split(" to ")[0]
        : undefined;
      await sendSMS(number, body);
    }

    setLastContact(contact);
    localStorage.setItem(LAST_CONTACT_STORAGE_KEY, JSON.stringify(contact));
  };

  const resources: LastContact[] = [
    {
      name: "SAMHSA National Helpline",
      description: "Free, confidential substance use support · 24/7",
      value: "1-800-662-4357",
      kind: "call",
    },
    {
      name: "Crisis Text Line",
      description: "Mental-health crisis counselor by text · 24/7",
      value: "HOME to 741741",
      kind: "text",
    },
  ];

  if (profile?.sponsor_phone) {
    resources.push({
      name: "Your Sponsor",
      description: "Personal recovery sponsor",
      value: profile.sponsor_phone,
      kind: "call",
    });
  }
  if (profile?.emergency_contact) {
    resources.push({
      name: "Emergency Contact",
      description: "Trusted personal contact",
      value: profile.emergency_contact,
      kind: "call",
    });
  }

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
        className="fixed bottom-20 right-4 z-50 p-3.5 rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, hsl(0 75% 55%), hsl(350 80% 50%))",
          boxShadow: "0 8px 32px hsl(0 75% 55% / 0.4), 0 0 0 1px hsl(0 75% 60% / 0.3)"
        }}
        aria-label="Emergency Support - Drag to reposition"
        whileDrag={{ scale: 1.1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Shield className="w-5 h-5 text-white" />

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
              <div className="card-enhanced p-6 relative overflow-hidden max-h-[85vh] overflow-y-auto">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-destructive/20 blur-[50px] rounded-full pointer-events-none" />

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
                    aria-label="Close emergency support"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Personal Reminder */}
                {profile?.personal_reminder && (
                  <div className="mb-5 p-4 rounded-xl glass-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-accent">Your Reason</span>
                    </div>
                    <p className="text-foreground font-medium">{profile.personal_reminder}</p>
                  </div>
                )}

                {/* Last used contact quick access */}
                {lastContact && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Last used
                      </span>
                    </div>
                    <button
                      onClick={() => requestContact(lastContact)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/15 transition-all duration-300 text-left"
                    >
                      <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
                        {lastContact.kind === "call" ? (
                          <Phone className="w-5 h-5 text-primary" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{lastContact.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lastContact.kind === "call" ? "Tap to call again" : "Tap to text again"}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">
                        {lastContact.value}
                      </span>
                    </button>
                  </div>
                )}

                {/* Resources */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                    Support resources
                  </span>
                  {resources.map((resource, index) => {
                    const Icon = resource.kind === "call" ? Phone : MessageCircle;
                    return (
                      <motion.button
                        key={resource.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => requestContact(resource)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 group text-left"
                      >
                        <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{resource.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">
                          {resource.value}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!pendingContact}
        onOpenChange={(open) => !open && setPendingContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingContact?.kind === "call" ? "Call" : "Text"} {pendingContact?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingContact?.kind === "call"
                ? `This will open your phone app and dial ${pendingContact?.value}.`
                : `This will open your messaging app to send "${pendingContact?.value}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmContact}>
              {pendingContact?.kind === "call" ? "Call now" : "Send text"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
