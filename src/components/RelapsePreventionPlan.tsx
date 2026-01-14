import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, X, Edit2, Save, AlertTriangle, Phone, Heart, Lightbulb, RefreshCw, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreventionPlan, useRealtimeSync } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PreventionPlan {
  warningSignals: string[];
  copingStrategies: string[];
  emergencyContacts: { name: string; phone: string }[];
  safeActivities: string[];
  personalReasons: string[];
}

const defaultPlan: PreventionPlan = {
  warningSignals: ["Feeling isolated", "Skipping meals", "Not sleeping well"],
  copingStrategies: ["Call sponsor", "Go for a walk", "Practice breathing"],
  emergencyContacts: [],
  safeActivities: ["Exercise", "Reading", "Cooking", "Calling a friend"],
  personalReasons: [],
};

export const RelapsePreventionPlan = () => {
  const { user } = useAuth();
  const { getPlan, savePlan: savePlanToDb } = usePreventionPlan();
  const [plan, setPlan] = useState<PreventionPlan>(defaultPlan);
  const [editSection, setEditSection] = useState<keyof PreventionPlan | null>(null);
  const [newItem, setNewItem] = useState("");
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadPlan = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getPlan();
      if (data) {
        setPlan({
          warningSignals: data.warning_signals || defaultPlan.warningSignals,
          copingStrategies: data.coping_strategies || defaultPlan.copingStrategies,
          emergencyContacts: (data.emergency_contacts as { name: string; phone: string }[]) || defaultPlan.emergencyContacts,
          safeActivities: data.safe_activities || defaultPlan.safeActivities,
          personalReasons: data.personal_reasons || defaultPlan.personalReasons,
        });
      }
    } catch (error) {
      console.error("Error loading prevention plan:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getPlan]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // Real-time sync for cross-device updates
  useRealtimeSync<{
    warning_signals: string[];
    coping_strategies: string[];
    emergency_contacts: { name: string; phone: string }[];
    safe_activities: string[];
    personal_reasons: string[];
  }>(
    "prevention_plans",
    user?.id,
    useCallback((data) => {
      if (data) {
        setPlan({
          warningSignals: data.warning_signals || [],
          copingStrategies: data.coping_strategies || [],
          emergencyContacts: data.emergency_contacts || [],
          safeActivities: data.safe_activities || [],
          personalReasons: data.personal_reasons || [],
        });
        toast.success("Plan synced from another device", {
          icon: <Cloud className="w-4 h-4" />,
        });
      }
    }, [])
  );

  const savePlan = async (updated: PreventionPlan) => {
    if (!user) {
      toast.error("Please sign in to save your plan");
      return;
    }

    setSyncing(true);
    setPlan(updated);

    const { error } = await savePlanToDb({
      warning_signals: updated.warningSignals,
      coping_strategies: updated.copingStrategies,
      emergency_contacts: updated.emergencyContacts,
      safe_activities: updated.safeActivities,
      personal_reasons: updated.personalReasons,
    });

    if (error) {
      toast.error("Failed to save plan. Please try again.");
    }
    
    setSyncing(false);
  };

  const addItem = (section: keyof PreventionPlan) => {
    if (!newItem.trim()) return;
    const updated = {
      ...plan,
      [section]: [...(plan[section] as string[]), newItem.trim()],
    };
    savePlan(updated);
    setNewItem("");
  };

  const removeItem = (section: keyof PreventionPlan, index: number) => {
    const updated = {
      ...plan,
      [section]: (plan[section] as string[]).filter((_, i) => i !== index),
    };
    savePlan(updated);
  };

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    const updated = {
      ...plan,
      emergencyContacts: [...plan.emergencyContacts, { ...newContact }],
    };
    savePlan(updated);
    setNewContact({ name: "", phone: "" });
  };

  const removeContact = (index: number) => {
    const updated = {
      ...plan,
      emergencyContacts: plan.emergencyContacts.filter((_, i) => i !== index),
    };
    savePlan(updated);
  };

  const sections = [
    {
      key: "warningSignals" as const,
      title: "Warning Signals",
      description: "Signs that I might be at risk",
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      key: "copingStrategies" as const,
      title: "Coping Strategies",
      description: "What I'll do when triggered",
      icon: Lightbulb,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      key: "safeActivities" as const,
      title: "Safe Activities",
      description: "Things that help me stay grounded",
      icon: Heart,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      key: "personalReasons" as const,
      title: "My Why",
      description: "Reasons I'm staying sober",
      icon: Shield,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-8 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          Relapse Prevention Plan
          {syncing && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
          {!syncing && user && <Cloud className="w-4 h-4 text-green-500 ml-auto" aria-label="Synced across devices" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your personalized safety toolkit
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency Contacts */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-500">Emergency Contacts</h4>
          </div>
          
          {plan.emergencyContacts.length > 0 ? (
            <div className="space-y-2 mb-3">
              {plan.emergencyContacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-background/50"
                >
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <a href={`tel:${contact.phone}`} className="text-xs text-primary">
                      {contact.phone}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeContact(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">
              Add emergency contacts for quick access during tough moments
            </p>
          )}

          {editSection === "emergencyContacts" ? (
            <div className="space-y-2">
              <Input
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addContact} disabled={syncing}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditSection(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditSection("emergencyContacts")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          )}
        </div>

        {/* Other Sections */}
        {sections.map((section) => (
          <div key={section.key} className={`p-4 rounded-xl ${section.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <div>
                  <h4 className={`font-semibold ${section.color}`}>{section.title}</h4>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditSection(editSection === section.key ? null : section.key)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {(plan[section.key] as string[]).map((item, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background/50 text-sm"
                >
                  {item}
                  {editSection === section.key && (
                    <button
                      onClick={() => removeItem(section.key, index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.span>
              ))}
            </div>

            <AnimatePresence>
              {editSection === section.key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder={`Add ${section.title.toLowerCase()}...`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem(section.key)}
                  />
                  <Button size="sm" onClick={() => addItem(section.key)} disabled={syncing}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
