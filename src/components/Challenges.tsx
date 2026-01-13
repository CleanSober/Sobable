import { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle, Circle, Trophy, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: string;
  tasks: { id: string; name: string; completed: boolean }[];
}

const weeklyChallenge: Challenge = {
  id: "week1",
  name: "Mindful Week",
  description: "Build healthy habits one day at a time",
  duration: "7 days",
  tasks: [
    { id: "1", name: "Complete a 5-min meditation", completed: false },
    { id: "2", name: "Log your mood for 3 days", completed: false },
    { id: "3", name: "Try a new coping strategy", completed: false },
    { id: "4", name: "Get 7+ hours of sleep", completed: false },
    { id: "5", name: "Call a supportive friend", completed: false },
    { id: "6", name: "Write in a gratitude journal", completed: false },
    { id: "7", name: "Exercise for 20 minutes", completed: false },
  ],
};

const STORAGE_KEY = "cleanSober_challenges";

export const Challenges = () => {
  const [challenge, setChallenge] = useState<Challenge>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : weeklyChallenge;
  });

  const toggleTask = (taskId: string) => {
    const updated = {
      ...challenge,
      tasks: challenge.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    };
    setChallenge(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const completedCount = challenge.tasks.filter((t) => t.completed).length;
  const progress = (completedCount / challenge.tasks.length) * 100;
  const isComplete = completedCount === challenge.tasks.length;

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Weekly Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="font-bold">{challenge.name}</h3>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-medium">{completedCount}/{challenge.tasks.length}</span>
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
            {challenge.tasks.map((task) => (
              <motion.button key={task.id} onClick={() => toggleTask(task.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${task.completed ? "bg-green-500/10" : "bg-muted/30 hover:bg-muted/50"}`}>
                {task.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.name}</span>
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
