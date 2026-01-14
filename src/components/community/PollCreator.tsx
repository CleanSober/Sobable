import { useState } from "react";
import { Plus, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PollCreatorProps {
  postId: string;
  onCreated: () => void;
}

export const PollCreator = ({ postId, onCreated }: PollCreatorProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowsMultiple, setAllowsMultiple] = useState(false);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    const trimmedQuestion = question.trim();
    const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);

    if (!trimmedQuestion) {
      toast.error("Please enter a question");
      return;
    }

    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.from("polls").insert({
        post_id: postId,
        question: trimmedQuestion,
        options: validOptions,
        allows_multiple: allowsMultiple,
      });

      if (error) throw error;

      toast.success("Poll created!");
      onCreated();
    } catch {
      toast.error("Failed to create poll");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <BarChart3 className="w-4 h-4" />
        Add Poll
      </div>

      <div className="space-y-2">
        <Label htmlFor="poll-question">Question</Label>
        <Input
          id="poll-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={100}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-choice" className="cursor-pointer">
          Allow multiple choices
        </Label>
        <Switch
          id="multiple-choice"
          checked={allowsMultiple}
          onCheckedChange={setAllowsMultiple}
        />
      </div>

      <Button onClick={createPoll} disabled={creating} className="w-full">
        {creating ? "Creating..." : "Create Poll"}
      </Button>
    </div>
  );
};
