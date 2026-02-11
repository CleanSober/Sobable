import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Moon, Shield, Eye, Wind, Smile, Sparkles,
  Droplets, Award, ChevronDown, ChevronUp, Zap, Leaf,
  Activity, Dna, Timer, Waves, Sun, Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HealthBenefit {
  days: number;
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  detail: string;
  category: "cardiovascular" | "neurological" | "digestive" | "immune" | "mental" | "physical";
}

const CATEGORIES = {
  cardiovascular: { label: "Heart & Blood", icon: Heart, color: "text-red-400", bg: "bg-red-500/10", ring: "stroke-red-400" },
  neurological: { label: "Brain & Nerves", icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10", ring: "stroke-violet-400" },
  digestive: { label: "Gut & Liver", icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "stroke-emerald-400" },
  immune: { label: "Immune System", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", ring: "stroke-blue-400" },
  mental: { label: "Mental Health", icon: Smile, color: "text-amber-400", bg: "bg-amber-500/10", ring: "stroke-amber-400" },
  physical: { label: "Body & Energy", icon: Zap, color: "text-primary", bg: "bg-primary/10", ring: "stroke-primary" },
};

const HEALTH_BENEFITS: HealthBenefit[] = [
  // Hours / Day 1
  { days: 1, icon: Heart, title: "Heart Rate Stabilizing", shortDesc: "Blood pressure begins to drop", detail: "Within 20 minutes of your last drink/use, your heart rate and blood pressure start returning to normal. Your body begins recalibrating its cardiovascular rhythm.", category: "cardiovascular" },
  { days: 1, icon: Activity, title: "Blood Oxygen Rising", shortDesc: "Oxygen levels improving", detail: "Carbon monoxide levels in your blood drop, allowing oxygen to circulate more effectively to your organs and tissues.", category: "cardiovascular" },

  // Days 2-3
  { days: 2, icon: Droplets, title: "Detox Initiated", shortDesc: "Body eliminating toxins", detail: "Your liver kicks into high gear, breaking down and flushing toxins. You may feel withdrawal symptoms — this is your body healing.", category: "digestive" },
  { days: 3, icon: Brain, title: "Dopamine Recalibrating", shortDesc: "Reward system adjusting", detail: "Your brain's dopamine receptors begin recovering from overstimulation. Natural pleasure responses start rebalancing — food, music, and conversation gradually feel more rewarding.", category: "neurological" },
  { days: 3, icon: Zap, title: "Nerve Repair Starting", shortDesc: "Peripheral nerves regenerating", detail: "Damaged nerve endings start to regrow, reducing tingling and numbness in extremities. Sensation and coordination begin improving.", category: "neurological" },

  // Week 1
  { days: 7, icon: Moon, title: "Sleep Architecture Improving", shortDesc: "REM cycles normalizing", detail: "Your sleep stages begin rebalancing. REM sleep increases, improving memory consolidation, emotional processing, and dream quality. You'll start waking more refreshed.", category: "mental" },
  { days: 7, icon: Leaf, title: "Gut Flora Recovering", shortDesc: "Digestive health improving", detail: "Your gut microbiome starts rebalancing. Beneficial bacteria populations recover, improving nutrient absorption, reducing inflammation, and strengthening your immune barrier.", category: "digestive" },

  // Week 2
  { days: 14, icon: Shield, title: "Immune System Strengthening", shortDesc: "White blood cells rebounding", detail: "Your immune system produces more white blood cells and antibodies. You become more resistant to infections, and existing inflammation starts to subside.", category: "immune" },
  { days: 14, icon: Waves, title: "Skin Rejuvenation", shortDesc: "Complexion clearing up", detail: "Better hydration and blood flow bring color back to your skin. Puffiness reduces, dark circles lighten, and your skin's natural repair cycle accelerates.", category: "physical" },

  // Month 1
  { days: 30, icon: Eye, title: "Cognitive Clarity", shortDesc: "Focus and memory sharpening", detail: "Gray matter density in your prefrontal cortex begins increasing. Working memory, decision-making, and concentration improve noticeably. Brain fog lifts.", category: "neurological" },
  { days: 30, icon: Dna, title: "Liver Regeneration", shortDesc: "Liver cells rebuilding", detail: "Your liver is one of the few organs that can regenerate. Fat deposits decrease, enzyme levels normalize, and liver function tests start improving.", category: "digestive" },
  { days: 30, icon: Heart, title: "Blood Pressure Normalized", shortDesc: "Cardiovascular risk dropping", detail: "Sustained normal blood pressure reduces strain on your heart and blood vessels. Risk of stroke and heart attack begins to decrease measurably.", category: "cardiovascular" },

  // Month 2
  { days: 60, icon: Wind, title: "Stamina Restored", shortDesc: "Physical energy increasing", detail: "With better sleep, nutrition absorption, and cardiovascular function, your physical energy and exercise capacity increase dramatically. Muscles recover faster.", category: "physical" },
  { days: 60, icon: Shield, title: "Chronic Inflammation Reducing", shortDesc: "Systemic inflammation dropping", detail: "C-reactive protein and other inflammatory markers decrease. This reduces risk of heart disease, diabetes, and autoimmune flare-ups.", category: "immune" },

  // Month 3
  { days: 90, icon: Sparkles, title: "Neuroplasticity Activated", shortDesc: "New neural pathways forming", detail: "Your brain is actively rewiring itself. New neural connections form around healthier habits and coping mechanisms. The prefrontal cortex regains control over impulsive urges.", category: "neurological" },
  { days: 90, icon: Sun, title: "Hormonal Balance", shortDesc: "Endocrine system normalizing", detail: "Cortisol, testosterone, estrogen, and thyroid hormones rebalance. This improves mood stability, libido, metabolism, and overall well-being.", category: "physical" },

  // Month 6
  { days: 180, icon: Smile, title: "Emotional Regulation Mastery", shortDesc: "Mood stability transformed", detail: "Your amygdala and prefrontal cortex work in better harmony. Emotional reactions become proportionate. Anxiety and depression symptoms often reduce significantly.", category: "mental" },
  { days: 180, icon: Timer, title: "Metabolic Recovery", shortDesc: "Weight and metabolism normalizing", detail: "Metabolic function stabilizes. Insulin sensitivity improves, weight tends to normalize, and your body processes nutrients more efficiently.", category: "physical" },

  // Year 1
  { days: 365, icon: Award, title: "Full Year Transformation", shortDesc: "Major organ repair complete", detail: "Liver function may return to near-normal. Heart disease risk drops substantially. Brain volume and cognitive function continue improving. Your body has undergone a remarkable transformation.", category: "cardiovascular" },
  { days: 365, icon: Brain, title: "Brain Volume Restored", shortDesc: "Gray matter density recovered", detail: "Studies show significant recovery of brain volume after one year of sobriety. Regions involved in decision-making, self-control, and emotional processing show measurable growth.", category: "neurological" },

  // Year 2+
  { days: 730, icon: Star, title: "Deep Cellular Renewal", shortDesc: "Cells fully regenerated", detail: "Most of your body's cells have been replaced with healthier versions. Cancer risk continues decreasing. Your biological age may test younger than your chronological age.", category: "immune" },
  { days: 1095, icon: Dna, title: "Epigenetic Healing", shortDesc: "Gene expression normalized", detail: "Three years of sobriety allows epigenetic changes — the way your genes express themselves shifts toward healthier patterns, potentially reducing hereditary disease risk.", category: "neurological" },
  { days: 1825, icon: Sparkles, title: "Five-Year Milestone", shortDesc: "Long-term resilience achieved", detail: "After five years, relapse risk drops dramatically. Your brain's reward system has fundamentally rewired. The coping patterns and neural pathways you've built become your new default.", category: "mental" },
];

interface HealthBenefitsTimelineProps {
  daysSober: number;
}

export const HealthBenefitsTimeline = ({ daysSober }: HealthBenefitsTimelineProps) => {
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const benefitsReached = HEALTH_BENEFITS.filter((b) => daysSober >= b.days);
  const nextBenefit = HEALTH_BENEFITS.find((b) => daysSober < b.days);
  const totalBenefits = HEALTH_BENEFITS.length;

  // Category progress
  const categoryProgress = Object.entries(CATEGORIES).map(([key, cat]) => {
    const categoryBenefits = HEALTH_BENEFITS.filter((b) => b.category === key);
    const unlocked = categoryBenefits.filter((b) => daysSober >= b.days).length;
    return { key, ...cat, total: categoryBenefits.length, unlocked, pct: categoryBenefits.length > 0 ? Math.round((unlocked / categoryBenefits.length) * 100) : 0 };
  });

  const filteredBenefits = activeCategory
    ? HEALTH_BENEFITS.filter((b) => b.category === activeCategory)
    : HEALTH_BENEFITS;

  const RING_R = 18;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-enhanced p-5">
      {/* Header - always visible, acts as toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 text-left"
      >
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Heart className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <span className="text-lg font-semibold text-foreground">Health Benefits</span>
          <p className="text-[10px] text-muted-foreground">
            {benefitsReached.length}/{totalBenefits} unlocked • Your body is healing
          </p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
      {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
      <div className="mt-4">

      {/* Category Progress Rings */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {categoryProgress.map((cat) => {
          const isActive = activeCategory === cat.key;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
                isActive ? "bg-secondary border border-primary/30" : "bg-secondary/30 hover:bg-secondary/60"
              }`}
            >
              <div className="relative w-11 h-11">
                <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r={RING_R} stroke="hsl(var(--secondary))" strokeWidth="3" fill="none" />
                  <motion.circle
                    cx="22" cy="22" r={RING_R}
                    className={cat.ring}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${RING_C}` }}
                    animate={{ strokeDasharray: `${(cat.pct / 100) * RING_C} ${RING_C}` }}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CatIcon className={`w-3.5 h-3.5 ${cat.color}`} />
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground font-medium leading-tight text-center truncate w-full">
                {cat.label.split(" ")[0]}
              </span>
              <span className="text-[9px] font-semibold text-foreground">
                {cat.unlocked}/{cat.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next Benefit Progress */}
      {nextBenefit && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <nextBenefit.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Next: {nextBenefit.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{nextBenefit.days - daysSober}d to go</span>
          </div>
          <Progress value={(daysSober / nextBenefit.days) * 100} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1.5">{nextBenefit.shortDesc}</p>
        </div>
      )}

      {/* Category Filter Label */}
      {activeCategory && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Showing: {CATEGORIES[activeCategory as keyof typeof CATEGORIES].label}
          </span>
          <button onClick={() => setActiveCategory(null)} className="text-xs text-primary font-medium">
            Show all
          </button>
        </div>
      )}

      {/* Benefits Timeline */}
      <div className="space-y-0.5">
        {filteredBenefits.map((benefit, i) => {
          const unlocked = daysSober >= benefit.days;
          const isNext = nextBenefit?.days === benefit.days && nextBenefit?.title === benefit.title;
          const isExpanded = expandedBenefit === i;
          const Icon = benefit.icon;
          const catInfo = CATEGORIES[benefit.category];
          const progressPct = unlocked ? 100 : Math.min(100, (daysSober / benefit.days) * 100);

          return (
            <motion.div
              key={`${benefit.days}-${benefit.title}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <button
                onClick={() => setExpandedBenefit(isExpanded ? null : i)}
                className={`w-full flex items-center gap-3 py-2.5 px-2 rounded-xl text-left transition-all active:scale-[0.98] ${
                  isExpanded ? "bg-secondary/60" : "hover:bg-secondary/30"
                } ${isNext ? "ring-1 ring-primary/30" : ""}`}
              >
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center w-5 shrink-0">
                  <motion.div
                    className={`w-3 h-3 rounded-full border-2 ${
                      unlocked
                        ? "bg-primary border-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                        : isNext
                        ? "bg-transparent border-primary animate-pulse"
                        : "bg-transparent border-muted-foreground/30"
                    }`}
                    animate={isNext ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  {i < filteredBenefits.length - 1 && (
                    <div className={`w-0.5 h-5 mt-0.5 ${unlocked ? "bg-primary/40" : "bg-border"}`} />
                  )}
                </div>

                {/* Icon */}
                <div className={`p-1.5 rounded-lg shrink-0 ${unlocked ? catInfo.bg : "bg-secondary/50"}`}>
                  <Icon className={`w-4 h-4 ${unlocked ? catInfo.color : "text-muted-foreground/40"}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${!unlocked && !isNext ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{benefit.title}</p>
                    {!unlocked && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0">
                        Day {benefit.days}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{benefit.shortDesc}</p>
                  {/* Mini progress for locked items */}
                  {!unlocked && (
                    <div className="mt-1 h-1 w-full max-w-[120px] bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        className="h-full bg-primary/50 rounded-full"
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mr-2 mb-2 p-3 rounded-lg bg-secondary/40 border border-border/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <catInfo.icon className={`w-3 h-3 ${catInfo.color}`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        {unlocked && (
                          <span className="ml-auto text-[10px] text-primary font-medium">✓ Unlocked at day {benefit.days}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{benefit.detail}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Overall progress */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground font-medium">Overall healing progress</span>
          <span className="text-xs font-semibold text-foreground">
            {Math.round((benefitsReached.length / totalBenefits) * 100)}%
          </span>
        </div>
        <Progress value={(benefitsReached.length / totalBenefits) * 100} className="h-2.5" />
      </div>
      </div>
      </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
