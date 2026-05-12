import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  /**
   * Optional analytics context. When provided, every welcome_tour_* event is
   * tagged with `user_type` and `is_first_time` so we can isolate first-time
   * guest sign-up tours from authed-user tours and from manual replays.
   */
  context?: {
    userType: "guest" | "authed";
    isFirstTime: boolean;
  } | null;
}

const SLIDES = [
  { id: "intro", icon: Sparkles, title: "Welcome to Sober Club", body: "A quick swipe-through of what lives inside the app — so you know exactly where to look when you need it.", accent: "from-primary to-primary/60" },
  { id: "home", icon: Home, title: "Home", body: "Your sobriety counter, money saved, daily affirmation, and quick actions — your morning anchor each day.", accent: "from-orange-500 to-rose-500" },
  { id: "checkin", icon: Heart, title: "Check-In", body: "Log your mood, energy, sleep and cravings in under a minute. It powers your streaks and personalized insights.", accent: "from-pink-500 to-rose-500" },
  { id: "triggers", icon: Brain, title: "Triggers & Tools", body: "Spot what sets you off, then reach for breathing exercises, the craving timer, or emergency support — anytime.", accent: "from-sky-500 to-indigo-500" },
  { id: "progress", icon: TrendingUp, title: "Progress", body: "See your streaks, badges, calendar heatmap and analytics. Watch the wins stack up week after week.", accent: "from-emerald-500 to-teal-500" },
  { id: "community", icon: Users, title: "Community", body: "Connect with others on the same path. Forums, live chat and accountability partners — judgment-free.", accent: "from-amber-500 to-yellow-500" },
];

export const WelcomeTour = ({ open, onComplete, context }: WelcomeTourProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;
  const isLast = current === total - 1;
  // Track which slides have been viewed to dedupe slide_viewed events
  const viewedRef = useRef<Set<number>>(new Set());
  // Whether the tour completed naturally (Get started on final slide).
  // Used to distinguish completion vs. skip on dismiss.
  const completedRef = useRef(false);
  const startedAtRef = useRef<number>(0);
  // Element that was focused before the dialog opened, so we can restore focus
  // to it on close (Radix only auto-restores when there's a DialogTrigger).
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const logSlideView = (index: number) => {
    if (viewedRef.current.has(index)) return;
    viewedRef.current.add(index);
    const slide = SLIDES[index];
    trackEvent("welcome_tour_slide_viewed", {
      slide_index: index,
      slide_id: slide?.id,
      total_slides: total,
    });
  };

  // Fire "started" + first slide view when the dialog opens
  useEffect(() => {
    if (!open) return;
    // Capture the element that had focus right before the dialog opened so we
    // can return focus to it after close (e.g. the "Replay Welcome Tour" button).
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      previousFocusRef.current = active;
    } else {
      previousFocusRef.current = null;
    }
    startedAtRef.current = Date.now();
    completedRef.current = false;
    viewedRef.current = new Set();
    trackEvent("welcome_tour_started", { total_slides: total });
    logSlideView(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!api) return;
    const handler = () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx);
      logSlideView(idx);
    };
    handler();
    api.on("select", handler);
    return () => {
      api.off("select", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const finish = (completed: boolean) => {
    const duration_ms = startedAtRef.current ? Date.now() - startedAtRef.current : null;
    if (completed) {
      completedRef.current = true;
      trackEvent("welcome_tour_completed", {
        total_slides: total,
        slides_viewed: viewedRef.current.size,
        duration_ms,
      });
    } else {
      trackEvent("welcome_tour_skipped", {
        slide_index_at_skip: current,
        slide_id_at_skip: SLIDES[current]?.id,
        slides_viewed: viewedRef.current.size,
        total_slides: total,
        duration_ms,
      });
    }
    onComplete();
  };

  const next = () => {
    if (isLast) finish(true);
    else api?.scrollNext();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !completedRef.current) finish(false); }}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden gap-0"
        onCloseAutoFocus={(e) => {
          // Override Radix default so we can restore focus to the launch
          // control (or a sensible fallback on Home) instead of <body>.
          e.preventDefault();
          const target = previousFocusRef.current;
          const stillUsable =
            target &&
            target.isConnected &&
            !(target as HTMLButtonElement).disabled &&
            target.offsetParent !== null;
          if (stillUsable) {
            target!.focus();
          } else {
            const fallback =
              (document.querySelector("main h1") as HTMLElement | null) ??
              (document.querySelector("main") as HTMLElement | null);
            if (fallback) {
              if (!fallback.hasAttribute("tabindex")) fallback.setAttribute("tabindex", "-1");
              fallback.focus();
            }
          }
          previousFocusRef.current = null;
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Welcome tour</DialogTitle>
          <DialogDescription>Quick walkthrough of the main features.</DialogDescription>
        </VisuallyHidden>
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent>
            {SLIDES.map((slide, i) => {
              const Icon = slide.icon;
              const isActive = i === current;
              return (
                <CarouselItem
                  key={i}
                  aria-hidden={!isActive}
                  // Prevent off-screen slides from being part of the tab order
                  // or being announced as separate slide groups.
                  {...(!isActive ? { inert: "" as unknown as undefined } : {})}
                >
                  <div className="px-6 pt-8 pb-2 text-center" aria-live={isActive ? "polite" : "off"}>
                    <div
                      className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.accent} text-white shadow-xl`}
                    >
                      <Icon className="h-10 w-10" aria-hidden="true" />
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
          {/* Slide indicators (also act as jump controls) */}
          <div
            className="flex items-center justify-center gap-1.5 mt-2 mb-5"
            role="tablist"
            aria-label="Welcome tour slides"
          >
            {SLIDES.map((slide, i) => {
              const selected = i === current;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-current={selected ? "step" : undefined}
                  aria-label={`Slide ${i + 1} of ${total}: ${slide.title}${selected ? " (current)" : ""}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => api?.scrollTo(i)}
                  // Wrapper provides a generous, visible focus ring; the inner
                  // span is the actual visual dot/pill.
                  className="group p-1.5 -m-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-1.5 rounded-full transition-all ${
                      selected ? "w-6 bg-primary" : "w-1.5 bg-muted group-hover:bg-muted-foreground/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <nav
            className="flex items-center justify-between gap-3"
            aria-label="Welcome tour navigation"
          >
            {current === 0 ? (
              <button
                type="button"
                onClick={() => finish(false)}
                aria-label="Skip welcome tour"
                className="text-xs text-muted-foreground/70 underline-offset-4 hover:underline hover:text-muted-foreground transition-colors px-1.5 py-1 -mx-1.5 -my-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Skip
              </button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => finish(false)}
                aria-label="Skip welcome tour"
                className="text-muted-foreground focus-visible:ring-offset-background"
              >
                Skip
              </Button>
            )}
            <p className="text-xs text-muted-foreground hidden sm:block" aria-hidden="true">
              Swipe to explore
            </p>
            <Button
              onClick={next}
              autoFocus
              aria-label={isLast ? "Finish welcome tour and get started" : `Go to next slide (${current + 2} of ${total})`}
              className="flex-1 max-w-[160px] focus-visible:ring-offset-background"
            >
              {isLast ? "Get started" : "Next"}
              {!isLast && <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />}
            </Button>
          </nav>
        </div>
      </DialogContent>
    </Dialog>
  );
};
