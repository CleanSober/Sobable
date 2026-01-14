import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePolls } from "@/hooks/useForumFeatures";
import { cn } from "@/lib/utils";

interface PollDisplayProps {
  postId: string;
}

export const PollDisplay = ({ postId }: PollDisplayProps) => {
  const { poll, userVotes, loading, vote, getVoteCount, getTotalVotes } = usePolls(postId);
  const [voting, setVoting] = useState<number | null>(null);

  if (loading || !poll) return null;

  const totalVotes = getTotalVotes();
  const hasEnded = poll.ends_at && new Date(poll.ends_at) < new Date();
  const hasVoted = userVotes.length > 0;

  const handleVote = async (index: number) => {
    if (hasEnded) return;
    setVoting(index);
    await vote(index);
    setVoting(null);
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
      <h4 className="font-medium text-foreground mb-3">{poll.question}</h4>
      
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const voteCount = getVoteCount(index);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = userVotes.includes(index);
          const isVoting = voting === index;

          return (
            <motion.button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasEnded || isVoting}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full relative overflow-hidden rounded-lg p-3 text-left transition-all",
                "border border-border/50 hover:border-primary/50",
                isSelected && "border-primary bg-primary/10",
                hasEnded && "cursor-default"
              )}
            >
              {/* Background progress bar */}
              {(hasVoted || hasEnded) && (
                <div 
                  className="absolute inset-0 bg-primary/20 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.span>
                  )}
                  <span className={cn(
                    "text-sm",
                    isSelected && "font-medium text-foreground"
                  )}>
                    {option}
                  </span>
                </div>
                
                {(hasVoted || hasEnded) && (
                  <span className="text-xs text-muted-foreground">
                    {voteCount} vote{voteCount !== 1 ? "s" : ""} ({Math.round(percentage)}%)
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        {poll.allows_multiple && <span>Multiple choices allowed</span>}
        {hasEnded && <span className="text-destructive">Poll ended</span>}
      </div>
    </div>
  );
};
