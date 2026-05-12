import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Home, Heart, Brain, TrendingUp, Users, ChevronRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface WelcomeTourProps {
  open: boolean;
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: Sparkles,
    title: "Welcome to Sober Club",
    body: "A quick swipe-through of what lives inside the app — so you know exactly where to look when you need it.",
    accent: "from-primary to-primary/60",
  },
  {
    icon: Home,
    title: "Home",
    body: "Your sobriety counter, money saved, daily affirmation, and quick actions — your morning anchor each day.",
    accent: "from-orange-500 to-rose-500",
  },
  {
    icon: Heart,
    title: "Check-In",
    body: "Log your mood, energy, sleep and cravings in under a minute. It powers your streaks and personalized insights.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Brain,
    title: "Triggers & Tools",
    body: "Spot what sets you off, then reach for breathing exercises, the craving timer, or emergency support — anytime.",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Progress",
    body: "See your streaks, badges, calendar heatmap and analytics. Watch the wins stack up week after week.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Community",
    body: "Connect with others on the same path. Forums, live chat and accountability partners — judgment-free.",
    accent: "from-amber-500 to-yellow-500",
  },
];

export const WelcomeTour = ({ open, onComplete }: WelcomeTourProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;
  const isLast = current === total - 1;

  useEffect(() => {
    if (!api) return;
    const handler = () => setCurrent(api.selectedScrollSnap());
    handler();
    api.on("select", handler);
    return () => {
      api.off("select", handler);
    };
  }, [api]);

  const next = () => {
    if (isLast) onComplete();
    else api?.scrollNext();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onComplete(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent>
            {SLIDES.map((slide, i) => {
              const Icon = slide.icon;
              return (
                <CarouselItem key={i}>
                  <div className="px-6 pt-8 pb-2 text-center">
                    <div
                      className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.accent} text-white shadow-xl`}
                    >
                      <Icon className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{slide.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[64px]">
                      {slide.body}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="px-6 pb-6">
          {/* Progress indicator */}
          <div
            className="flex items-center justify-center gap-1.5 mt-2 mb-5"
            role="tablist"
            aria-label="Tour progress"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Swipe to explore
            </p>
            <Button onClick={next} className="flex-1 max-w-[160px]">
              {isLast ? "Get started" : "Next"}
              {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
