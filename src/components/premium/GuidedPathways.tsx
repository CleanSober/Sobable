import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronRight, Check, Play, Lock, Shield, Brain, Moon, Compass, Flower } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PathwayTask {
  week: number;
  title: string;
  tasks: string[];
}

interface Pathway {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  difficulty: string;
  category: string;
  icon: string;
  tasks: PathwayTask[];
}

interface PathwayProgress {
  id: string;
  pathway_id: string;
  current_week: number;
  completed_tasks: string[];
  is_active: boolean;
  started_at: string;
}

const iconMap: Record<string, any> = {
  shield: Shield, brain: Brain, moon: Moon, compass: Compass, lotus: Flower,
};

export const GuidedPathways = () => {
  const { isPremium } = usePremiumStatus();
  const { user } = useAuth();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [progress, setProgress] = useState<PathwayProgress[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium || !user) { setLoading(false); return; }
    const fetch = async () => {
      const [pathRes, progRes] = await Promise.all([
        supabase.from("recovery_pathways").select("*").eq("is_active", true),
        supabase.from("pathway_progress").select("*").eq("user_id", user.id),
      ]);
      setPathways((pathRes.data || []).map(p => ({ ...p, tasks: (p.tasks as any) || [] })));
      setProgress(progRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [isPremium, user]);

  const getProgress = (pathwayId: string) => progress.find(p => p.pathway_id === pathwayId);

  const startPathway = async (pathway: Pathway) => {
    if (!user) return;
    const { error } = await supabase.from("pathway_progress").insert({
      user_id: user.id,
      pathway_id: pathway.id,
      current_week: 1,
      completed_tasks: [],
      is_active: true,
    });
    if (!error) {
      setProgress(prev => [...prev, { id: "", pathway_id: pathway.id, current_week: 1, completed_tasks: [], is_active: true, started_at: new Date().toISOString() }]);
      toast.success(`Started "${pathway.title}"!`);
    }
  };

  const toggleTask = async (pathwayId: string, taskId: string) => {
    if (!user) return;
    const prog = getProgress(pathwayId);
    if (!prog) return;

    const completed = prog.completed_tasks.includes(taskId)
      ? prog.completed_tasks.filter(t => t !== taskId)
      : [...prog.completed_tasks, taskId];

    await supabase.from("pathway_progress").update({ completed_tasks: completed, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("pathway_id", pathwayId);
    setProgress(prev => prev.map(p => p.pathway_id === pathwayId ? { ...p, completed_tasks: completed } : p));
  };

  const getCompletionPercent = (pathway: Pathway, prog: PathwayProgress | undefined) => {
    if (!prog) return 0;
    const totalTasks = pathway.tasks.reduce((sum, w) => sum + w.tasks.length, 0);
    if (totalTasks === 0) return 0;
    return Math.round((prog.completed_tasks.length / totalTasks) * 100);
  };

  // Premium lock is handled by PremiumLockOverlay wrapper in parent

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="card-enhanced overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-foreground">Recovery Pathways</h3>
                  <Crown className="w-3 h-3 text-accent" />
                </div>
                <p className="text-[9px] text-muted-foreground">Structured programs for your journey</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-3 text-[10px] text-muted-foreground">Loading pathways...</div>
            ) : (
              <div className="space-y-1.5">
                {pathways.map((pathway) => {
                  const prog = getProgress(pathway.id);
                  const pct = getCompletionPercent(pathway, prog);
                  const Icon = iconMap[pathway.icon] || Compass;

                  return (
                    <motion.button
                      key={pathway.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPathway(pathway)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition text-left"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{pathway.title}</p>
                        <p className="text-[9px] text-muted-foreground">{pathway.duration_weeks} weeks • {pathway.difficulty}</p>
                        {prog && (
                          <div className="mt-1">
                            <Progress value={pct} className="h-1" />
                            <p className="text-[8px] text-muted-foreground mt-0.5">{pct}% complete</p>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pathway Detail Modal */}
      <Dialog open={!!selectedPathway} onOpenChange={() => setSelectedPathway(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedPathway && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{selectedPathway.title}</DialogTitle>
                <p className="text-xs text-muted-foreground">{selectedPathway.description}</p>
              </DialogHeader>

              {!getProgress(selectedPathway.id) ? (
                <Button onClick={() => startPathway(selectedPathway)} className="w-full mt-2 bg-gradient-to-r from-primary to-accent text-white">
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Start Pathway
                </Button>
              ) : (
                <div className="space-y-3 mt-2">
                  {selectedPathway.tasks.map((week, wi) => {
                    const prog = getProgress(selectedPathway.id);
                    return (
                      <div key={wi}>
                        <h4 className="text-[11px] font-bold text-foreground mb-1.5">
                          Week {week.week}: {week.title}
                        </h4>
                        <div className="space-y-1">
                          {week.tasks.map((task, ti) => {
                            const taskId = `w${week.week}-t${ti}`;
                            const done = prog?.completed_tasks.includes(taskId);
                            return (
                              <button
                                key={ti}
                                onClick={() => toggleTask(selectedPathway.id, taskId)}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition text-left ${
                                  done ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 hover:bg-secondary/80"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  done ? "bg-primary text-white" : "border border-muted-foreground/30"
                                }`}>
                                  {done && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className={`text-[10px] ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {task}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
