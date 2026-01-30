import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateForumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForumCreated?: () => void;
}

const FORUM_CATEGORIES = [
  { value: "support", label: "Support & Recovery" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "lifestyle", label: "Lifestyle & Hobbies" },
  { value: "discussions", label: "General Discussions" },
  { value: "resources", label: "Resources & Tips" },
];

export const CreateForumModal = memo(({ open, onOpenChange, onForumCreated }: CreateForumModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreate = async () => {
    if (!user || !title.trim()) return;

    setCreating(true);
    setError(null);

    const slug = generateSlug(title);

    try {
      // Check if slug already exists
      const { data: existing } = await supabase
        .from("forums")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        setError("A forum with a similar name already exists. Try a different title.");
        setCreating(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("forums")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          slug,
          created_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success("Forum created successfully!");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setCategory("");
      onForumCreated?.();
    } catch (err) {
      console.error("Failed to create forum:", err);
      setError("Failed to create forum. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const isValid = title.trim().length >= 3 && title.trim().length <= 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Forum
          </DialogTitle>
          <DialogDescription>
            Start a new discussion space for the community
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4"
        >
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="forum-title">Forum Title *</Label>
            <Input
              id="forum-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Motivation"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-description">Description</Label>
            <Textarea
              id="forum-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will members discuss here?"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-category">Category (optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="forum-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {FORUM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isValid || creating}
              className="gradient-primary text-primary-foreground"
            >
              {creating ? "Creating..." : "Create Forum"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});

CreateForumModal.displayName = "CreateForumModal";