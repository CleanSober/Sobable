import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle, Circle, Trophy, Flame, RefreshCw, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChallengeProgress, useRealtimeSync } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChallengeTask {
  id: string;
  name: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: string;
  tasks: ChallengeTask[];
}

const weeklyChallenge: Challenge = {
  id: "week1",
  name: "Mindful Week",
  description: "Build healthy habits one day at a time",
  duration: "7 days",
  tasks: [
    { id: "1", name: "Complete a 5-min meditation" },
    { id: "2", name: "Log your mood for 3 days" },
    { id: "3", name: "Try a new coping strategy" },
    { id: "4", name: "Get 7+ hours of sleep" },
    { id: "5", name: "Call a supportive friend" },
    { id: "6", name: "Write in a gratitude journal" },
    { id: "7", name: "Exercise for 20 minutes" },
  ],
};

export const Challenges = () => {
  const { user } = useAuth();
  const { getChallengeProgress, saveChallengeProgress } = useChallengeProgress();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getChallengeProgress(weeklyChallenge.id);
      if (data?.completed_tasks) {
        setCompletedTasks(data.completed_tasks);
      }
    } catch (error) {
      console.error("Error loading challenge progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getChallengeProgress]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Real-time sync for cross-device updates
  useRealtimeSync<{ completed_tasks: string[] }>(
    "challenge_progress",
    user?.id,
    useCallback((data) => {
      if (data?.completed_tasks) {
        setCompletedTasks(data.completed_tasks);
        toast.success("Challenge synced from another device", {
          icon: <Cloud className="w-4 h-4" />,
        });
      }
    }, [])
  );

  const toggleTask = async (taskId: string) => {
    if (!user) {
      toast.error("Please sign in to track your progress");
      return;
    }

    setSyncing(true);
    
    const newCompletedTasks = completedTasks.includes(taskId)
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId];
    
    // Optimistic update
    setCompletedTasks(newCompletedTasks);
    
    const { error } = await saveChallengeProgress(weeklyChallenge.id, newCompletedTasks);
    
    if (error) {
      // Revert on error
      setCompletedTasks(completedTasks);
      toast.error("Failed to save progress. Please try again.");
    }
    
    setSyncing(false);
  };

  const completedCount = completedTasks.length;
  const progress = (completedCount / weeklyChallenge.tasks.length) * 100;
  const isComplete = completedCount === weeklyChallenge.tasks.length;

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
          <Target className="w-5 h-5 text-primary" />
          Weekly Challenge
          {syncing && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
          {!syncing && user && <Cloud className="w-4 h-4 text-green-500 ml-auto" aria-label="Synced across devices" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="font-bold">{weeklyChallenge.name}</h3>
              <p className="text-sm text-muted-foreground">{weeklyChallenge.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-medium">{completedCount}/{weeklyChallenge.tasks.length}</span>
          </div>
        </div>

        {isComplete ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-yellow-500">Challenge Complete! 🎉</h3>
            <p className="text-muted-foreground">You're building amazing habits!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {weeklyChallenge.tasks.map((task) => {
              const isTaskCompleted = completedTasks.includes(task.id);
              return (
                <motion.button 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)} 
                  disabled={syncing}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isTaskCompleted ? "bg-green-500/10" : "bg-muted/30 hover:bg-muted/50"} ${syncing ? "opacity-50" : ""}`}
                >
                  {isTaskCompleted ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  <span className={isTaskCompleted ? "line-through text-muted-foreground" : ""}>{task.name}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
