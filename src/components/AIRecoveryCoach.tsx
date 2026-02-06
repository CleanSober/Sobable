import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, X, Sparkles, Loader2, RefreshCw, Crown,
  Brain, Heart, Shield, TrendingUp, Moon, Flame
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { calculateDaysSober } from "@/lib/storage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PremiumGate } from "@/components/community/PremiumGate";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recovery-coach`;

interface QuickPrompt {
  icon: React.ElementType;
  label: string;
  prompt: string;
  color: string;
}

const quickPrompts: QuickPrompt[] = [
  {
    icon: Flame,
    label: "Craving help",
    prompt: "I'm feeling a craving right now. Can you look at my recent triggers and help me with a coping strategy that's worked for me before?",
    color: "text-red-400",
  },
  {
    icon: TrendingUp,
    label: "Analyze my week",
    prompt: "Can you analyze my mood, sleep, and trigger data from this past week and give me insights on how I'm doing?",
    color: "text-primary",
  },
  {
    icon: Shield,
    label: "Prevention check",
    prompt: "Review my relapse prevention plan and suggest improvements based on my recent patterns and triggers.",
    color: "text-blue-400",
  },
  {
    icon: Heart,
    label: "Celebrate wins",
    prompt: "What are my recent wins and achievements? Help me celebrate my progress!",
    color: "text-pink-400",
  },
  {
    icon: Moon,
    label: "Sleep & recovery",
    prompt: "How is my sleep affecting my recovery? Analyze my sleep data and give me tips to improve.",
    color: "text-indigo-400",
  },
  {
    icon: Brain,
    label: "Pattern insights",
    prompt: "What patterns do you see in my triggers and emotions? Help me understand my biggest risk factors.",
    color: "text-amber-400",
  },
];

export const AIRecoveryCoach = () => {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOpenChat = () => {
    if (!isPremium && !premiumLoading) {
      setShowUpgrade(true);
    } else {
      setIsOpen(true);
    }
  };

  const daysSober = profile?.sobriety_start_date
    ? calculateDaysSober(profile.sobriety_start_date)
    : 0;

  const welcomeMessage = useMemo(() => {
    const greeting = daysSober > 0
      ? `**${daysSober} days strong!** 🎉 I have access to all your recovery data — mood, triggers, sleep, journal, and more.`
      : "I have access to all your recovery data to give you personalized support.";

    return `Hey${profile?.display_name ? ` ${profile.display_name}` : ""}! 🌟 ${greeting}

I can:
- **Analyze patterns** in your mood, triggers & sleep
- **Help with cravings** using strategies that worked for you before
- **Review your prevention plan** and suggest improvements
- **Celebrate your wins** and track your progress

How can I support you today?`;
  }, [daysSober, profile?.display_name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, [isOpen, welcomeMessage]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use the Recovery Coach");
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (response.status === 429) {
        toast.error("Too many requests — please wait a moment and try again.");
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }
      if (response.status === 402) {
        toast.error("AI credits depleted. Please add credits in workspace settings.");
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to coach");
      }
      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      if (assistantContent === "") {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    streamChat(prompt);
  };

  const resetChat = () => {
    setMessages([{ role: "assistant", content: welcomeMessage }]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenChat}
        className="fixed bottom-24 left-6 z-40 p-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 transition-shadow"
        aria-label="Open AI Recovery Coach"
      >
        <Bot className="w-6 h-6" />
        <Crown className="absolute -top-1 -right-1 w-4 h-4 text-amber-300" />
      </motion.button>

      {/* Premium Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgrade(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-4 z-50 flex items-center justify-center"
            >
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setShowUpgrade(false)} className="absolute top-2 right-2 z-10">
                  <X className="w-5 h-5" />
                </Button>
                <PremiumGate />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-2 z-50 md:inset-auto md:bottom-8 md:right-8 md:w-[460px] md:h-[650px] flex flex-col"
            >
              <div className="flex-1 flex flex-col rounded-2xl gradient-card shadow-soft border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Recovery Coach</h3>
                      <p className="text-xs text-muted-foreground">
                        AI-powered • Data-driven insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={resetChat} title="New conversation" className="h-8 w-8">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary/70 text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="text-sm prose prose-sm prose-invert max-w-none [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>blockquote]:my-1.5 [&>blockquote]:border-primary/50 [&>blockquote]:text-muted-foreground [&_strong]:text-foreground [&_li]:my-0.5">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-secondary/70 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">Analyzing your data...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Quick actions</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickPrompts.map((qp) => {
                        const Icon = qp.icon;
                        return (
                          <button
                            key={qp.label}
                            onClick={() => handleQuickPrompt(qp.prompt)}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-secondary/50 text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 text-left active:scale-[0.97]"
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${qp.color}`} />
                            <span className="truncate">{qp.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-border/50">
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder="Ask about your recovery data..."
                      className="min-h-[44px] max-h-32 resize-none bg-secondary/50 text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="shrink-0 gradient-primary"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
