import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Shield, Sparkles, PartyPopper, Rocket, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useHaptics } from "@/hooks/useHaptics";
import { SUBSTANCE_OPTIONS } from "@/lib/substanceConfig";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  initialName?: string;
}

const TOTAL_STEPS = 4;
const CELEBRATION_DURATION = 3500;

export const Onboarding = ({ onComplete, initialName }: OnboardingProps) => {
  const hasInitialName = !!(initialName && initialName.trim());
  const [step, setStep] = useState(hasInitialName ? 2 : 1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [name, setName] = useState(initialName?.trim() || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedSubstances, setSelectedSubstances] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dailySpending, setDailySpending] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const toggleSubstance = (id: string) => {
    setSelectedSubstances((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const { notification, impact } = useHaptics();

  const handleComplete = useCallback(() => {
    setShowCelebration(true);

    // Haptic celebration burst: success notification + heavy impact combo
    notification('success');
    setTimeout(() => impact('heavy'), 200);
    setTimeout(() => impact('medium'), 400);
    setTimeout(() => impact('light'), 550);

    const data: OnboardingData = {
      name: isAnonymous ? "" : name.trim().slice(0, 50),
      substances: selectedSubstances,
      sobrietyStartDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      dailySpending: parseFloat(dailySpending) || 0,
      personalReminder: personalReminder.trim().slice(0, 500) || undefined,
      sponsorPhone: sponsorPhone.trim().slice(0, 20) || undefined,
      emergencyContact: emergencyContact.trim().slice(0, 20) || undefined,
    };

    setTimeout(() => {
      onComplete(data);
    }, CELEBRATION_DURATION);
  }, [isAnonymous, name, selectedSubstances, startDate, dailySpending, personalReminder, sponsorPhone, emergencyContact, onComplete, notification, impact]);

  const canProceed = () => {
    switch (step) {
      case 1: return isAnonymous || name.trim().length > 0;
      case 2: return selectedSubstances.length > 0;
      case 3: return startDate !== undefined;
      case 4: return true;
      default: return true;
    }
  };

  const stepTitles = [
    { title: "What's your name?", subtitle: "Let's personalize your experience" },
    { title: "What are you recovering from?", subtitle: "Select all that apply" },
    { title: "When did your journey start?", subtitle: "Set your sobriety date" },
    { title: "Almost there!", subtitle: "Optional details to help you" },
  ];

  const currentTitle = stepTitles[step - 1];

  if (showCelebration) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
        <ConfettiCelebration duration={CELEBRATION_DURATION} />

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.3 }}
            className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
          >
            <PartyPopper className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            You're all set! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground text-base mb-6"
          >
            Your recovery journey starts now.{"\n"}We're proud of you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-2 text-sm text-primary font-medium"
          >
            <Rocket className="w-4 h-4" />
            <span>Loading your dashboard...</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col p-5 top-safe relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/8 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/8 blur-[80px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative z-10">
        {/* Progress bar */}
        <div className="pt-2 pb-6">
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <motion.div
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i < step ? "gradient-primary" : "bg-secondary"
                }`}
                initial={false}
                animate={{ opacity: i < step ? 1 : 0.4 }}
              />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs text-primary font-medium flex items-center gap-0.5 active:scale-95"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">{currentTitle.title}</h1>
                <p className="text-sm text-muted-foreground">{currentTitle.subtitle}</p>
              </div>

              {/* Step 1: Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isAnonymous}
                    maxLength={50}
                    autoFocus
                    className="text-center text-lg h-12 bg-secondary/50 border-border/50"
                  />

                  <button
                    onClick={() => { setIsAnonymous(!isAnonymous); if (!isAnonymous) setName(""); }}
                    className={`w-full p-3 rounded-xl text-sm transition-all border flex items-center justify-center gap-2 active:scale-[0.98] ${
                      isAnonymous
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    {isAnonymous ? "✓ Staying anonymous" : "Prefer to stay anonymous"}
                  </button>

                  <p className="text-xs text-center text-muted-foreground px-4">
                    Your privacy matters. You can change this anytime in settings.
                  </p>
                </div>
              )}

              {/* Step 2: Substances */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Substances</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBSTANCE_OPTIONS.filter(s => s.category === "substance").map((substance) => {
                        const selected = selectedSubstances.includes(substance.id);
                        return (
                          <button
                            key={substance.id}
                            onClick={() => toggleSubstance(substance.id)}
                            className={`relative p-3 rounded-xl text-left transition-all border active:scale-[0.97] ${
                              selected
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-secondary/50"
                            }`}
                          >
                            <span className="text-lg mb-0.5 block">{substance.emoji}</span>
                            <span className="text-xs font-medium text-foreground">{substance.label}</span>
                            {selected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Behavioral</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBSTANCE_OPTIONS.filter(s => s.category === "behavioral").map((substance) => {
                        const selected = selectedSubstances.includes(substance.id);
                        return (
                          <button
                            key={substance.id}
                            onClick={() => toggleSubstance(substance.id)}
                            className={`relative p-3 rounded-xl text-left transition-all border active:scale-[0.97] ${
                              selected
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-secondary/50"
                            }`}
                          >
                            <span className="text-lg mb-0.5 block">{substance.emoji}</span>
                            <span className="text-xs font-medium text-foreground">{substance.label}</span>
                            {selected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Date + Spending combined */}
              {step === 3 && (
                <div className="space-y-5">
                   <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sobriety start date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal bg-secondary/50 border-border/50",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Daily spending (optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={dailySpending}
                        onChange={(e) => setDailySpending(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="10000"
                        className="text-lg pl-8 h-12 bg-secondary/50 border-border/50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">We'll track how much money you're saving</p>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground">
                      Every journey begins with a single step 🌱
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Support system (all optional) */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Why did you quit?
                    </label>
                    <Textarea
                      value={personalReminder}
                      onChange={(e) => setPersonalReminder(e.target.value)}
                      placeholder="For my family, for my health..."
                      className="bg-secondary/50 border-border/50 resize-none text-sm"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Sponsor phone</label>
                    <Input
                      type="tel"
                      value={sponsorPhone}
                      onChange={(e) => setSponsorPhone(e.target.value)}
                      placeholder="Optional"
                      className="h-11 bg-secondary/50 border-border/50 text-sm"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Emergency contact</label>
                    <Input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Optional"
                      className="h-11 bg-secondary/50 border-border/50 text-sm"
                      maxLength={20}
                    />
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    All fields on this step are optional — you can add them later
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="pb-6 pt-4">
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="w-full h-12 font-semibold gradient-primary text-primary-foreground text-base"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="w-full h-12 font-semibold gradient-primary text-primary-foreground text-base"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Start My Journey
            </Button>
          )}

          {step === TOTAL_STEPS && (
            <button
              onClick={handleComplete}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
