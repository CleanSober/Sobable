import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const substances = [
  { id: "alcohol", label: "Alcohol", emoji: "🍺" },
  { id: "cocaine", label: "Cocaine", emoji: "❄️" },
  { id: "cannabis", label: "Cannabis", emoji: "🌿" },
  { id: "nicotine", label: "Nicotine", emoji: "🚬" },
  { id: "opioids", label: "Opioids", emoji: "💊" },
  { id: "other", label: "Other", emoji: "🔄" },
];

interface OnboardingData {
  name: string;
  substances: string[];
  sobrietyStartDate: string;
  dailySpending: number;
  sponsorPhone?: string;
  emergencyContact?: string;
  personalReminder?: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedSubstances, setSelectedSubstances] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [dailySpending, setDailySpending] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const toggleSubstance = (id: string) => {
    setSelectedSubstances((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    const data: OnboardingData = {
      name: isAnonymous ? "" : name.trim().slice(0, 50),
      substances: selectedSubstances,
      sobrietyStartDate: startDate,
      dailySpending: parseFloat(dailySpending) || 0,
      personalReminder: personalReminder.trim().slice(0, 500) || undefined,
      sponsorPhone: sponsorPhone.trim().slice(0, 20) || undefined,
      emergencyContact: emergencyContact.trim().slice(0, 20) || undefined,
    };
    onComplete(data);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return isAnonymous || name.trim().length > 0;
      case 2:
        return selectedSubstances.length > 0;
      case 3:
        return startDate !== "";
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full mx-1 transition-colors ${
                  s <= step ? "gradient-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of 5
          </p>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl gradient-card shadow-card border border-border/50 p-6"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to Clean & Sober
                </h1>
                <p className="text-muted-foreground">
                  What should we call you?
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isAnonymous}
                  maxLength={50}
                  className="text-center text-lg bg-secondary/50 border-border/50"
                />
                
                <button
                  onClick={() => {
                    setIsAnonymous(!isAnonymous);
                    if (!isAnonymous) setName("");
                  }}
                  className={`w-full p-3 rounded-xl text-sm transition-all border ${
                    isAnonymous
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/50 bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {isAnonymous ? "✓ Staying anonymous" : "Prefer to stay anonymous"}
                </button>
              </div>

              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Your privacy matters. You can change this anytime in settings.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  What are you recovering from?
                </h1>
                <p className="text-muted-foreground">
                  Select all that apply
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {substances.map((substance) => (
                  <button
                    key={substance.id}
                    onClick={() => toggleSubstance(substance.id)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      selectedSubstances.includes(substance.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{substance.emoji}</span>
                    <span className="text-sm font-medium text-foreground">
                      {substance.label}
                    </span>
                    {selectedSubstances.includes(substance.id) && (
                      <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  When did you start?
                </h1>
                <p className="text-muted-foreground">
                  Set your sobriety date
                </p>
              </div>

              <div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="text-center text-lg bg-secondary/50 border-border/50"
                />
              </div>

              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Every journey begins with a single step. Your first day is just as important as your 1000th.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Track Your Savings
                </h1>
                <p className="text-muted-foreground">
                  How much did you spend daily?
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={dailySpending}
                  onChange={(e) => setDailySpending(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="10000"
                  className="text-center text-2xl pl-8 bg-secondary/50 border-border/50"
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                This helps us show you how much money you're saving
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Your Support System
                </h1>
                <p className="text-muted-foreground">
                  Optional but helpful for tough moments
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Why did you quit? (Your personal reminder)
                  </label>
                  <Textarea
                    value={personalReminder}
                    onChange={(e) => setPersonalReminder(e.target.value)}
                    placeholder="For my family, for my health..."
                    className="bg-secondary/50 border-border/50 resize-none"
                    rows={2}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sponsor phone number
                  </label>
                  <Input
                    type="tel"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value)}
                    placeholder="Optional"
                    className="bg-secondary/50 border-border/50"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Emergency contact
                  </label>
                  <Input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Optional"
                    className="bg-secondary/50 border-border/50"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 border-border/50"
              >
                Back
              </Button>
            )}

            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Start My Journey
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
