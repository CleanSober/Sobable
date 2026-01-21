import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  Heart, 
  Trash2, 
  Download, 
  Calendar,
  Tag,
  ChevronRight,
  X,
  Loader2,
  FileText,
  FileJson,
  Table,
  Lightbulb,
  Brain,
  Smile
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useJournal, JournalEntry } from '@/hooks/useJournal';
import { format } from 'date-fns';

const promptCategories = [
  { id: 'gratitude', label: 'Gratitude', icon: Heart, color: 'text-pink-400' },
  { id: 'reflection', label: 'Reflection', icon: Brain, color: 'text-purple-400' },
  { id: 'goals', label: 'Goals', icon: Lightbulb, color: 'text-amber-400' },
  { id: 'challenges', label: 'Challenges', icon: BookOpen, color: 'text-blue-400' },
  { id: 'celebration', label: 'Celebration', icon: Sparkles, color: 'text-teal-400' },
];

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '✨', '🌟', '💫'];

interface JournalProps {
  daysSober?: number;
}

export const Journal: React.FC<JournalProps> = ({ daysSober = 0 }) => {
  const {
    entries,
    loading,
    searchQuery,
    setSearchQuery,
    createEntry,
    deleteEntry,
    toggleFavorite,
    getAIPrompt,
    analyzeMood,
    suggestTags,
    exportEntries,
  } = useJournal();

  const [isWriting, setIsWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', tags: [] as string[] });
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleGetPrompt = async (category: string) => {
    setLoadingPrompt(true);
    const prompt = await getAIPrompt(category, daysSober);
    setAiPrompt(prompt);
    setLoadingPrompt(false);
  };

  const handleAnalyzeMood = async () => {
    if (!newEntry.content.trim()) return;
    
    setLoadingAnalysis(true);
    const analysis = await analyzeMood(newEntry.content);
    setMoodAnalysis(analysis);
    
    const tags = await suggestTags(newEntry.content);
    if (Array.isArray(tags)) {
      setSuggestedTags(tags);
    }
    setLoadingAnalysis(false);
  };

  const handleSaveEntry = async () => {
    if (!newEntry.content.trim()) return;

    await createEntry({
      title: newEntry.title || null,
      content: newEntry.content,
      ai_prompt: aiPrompt || null,
      mood_score: moodAnalysis?.mood_score || null,
      mood_analysis: moodAnalysis ? JSON.stringify(moodAnalysis) : null,
      tags: newEntry.tags,
    });

    // Reset form
    setNewEntry({ title: '', content: '', tags: [] });
    setAiPrompt('');
    setMoodAnalysis(null);
    setSuggestedTags([]);
    setIsWriting(false);
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newEntry.tags.includes(tag.toLowerCase())) {
      setNewEntry(prev => ({ ...prev, tags: [...prev.tags, tag.toLowerCase()] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setNewEntry(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleDeleteConfirm = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score <= 5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (score <= 7) return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Recovery Journal
            </CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportEntries('json')}>
                    <FileJson className="h-4 w-4 mr-2" />
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportEntries('txt')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportEntries('csv')}>
                    <Table className="h-4 w-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsWriting(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entry List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Start Your Journal</h3>
            <p className="text-muted-foreground mb-4">
              Journaling is a powerful tool for recovery. Write your first entry today.
            </p>
            <Button onClick={() => setIsWriting(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Write First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card 
                  className="bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          {entry.is_favorite && (
                            <Heart className="h-4 w-4 fill-pink-400 text-pink-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.created_at), 'MMM d, yyyy')}
                          </span>
                          {entry.mood_score && (
                            <Badge variant="outline" className={getMoodColor(entry.mood_score)}>
                              {moodEmojis[entry.mood_score - 1]} {entry.mood_score}/10
                            </Badge>
                          )}
                          {entry.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entry.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Entry Dialog */}
      <Dialog open={isWriting} onOpenChange={setIsWriting}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Write Journal Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* AI Prompt Section */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Need inspiration? Get an AI-powered prompt:
              </p>
              <div className="flex flex-wrap gap-2">
                {promptCategories.map(cat => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleGetPrompt(cat.id)}
                    disabled={loadingPrompt}
                    className="gap-2"
                  >
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    {cat.label}
                  </Button>
                ))}
              </div>
              {loadingPrompt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating prompt...
                </div>
              )}
              {aiPrompt && !loadingPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <p className="text-sm italic">"{aiPrompt}"</p>
                </motion.div>
              )}
            </div>

            {/* Entry Form */}
            <div className="space-y-3">
              <Input
                placeholder="Entry title (optional)"
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="What's on your mind? Share your thoughts, feelings, and reflections..."
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {newEntry.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
                {suggestedTags.filter(t => !newEntry.tags.includes(t)).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleAddTag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
            </div>

            {/* Mood Analysis */}
            {newEntry.content.length > 50 && (
              <Button
                variant="outline"
                onClick={handleAnalyzeMood}
                disabled={loadingAnalysis}
                className="w-full gap-2"
              >
                {loadingAnalysis ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Analyze Mood & Get Insights
                  </>
                )}
              </Button>
            )}

            {moodAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted/50 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mood Analysis</span>
                  <Badge className={getMoodColor(moodAnalysis.mood_score)}>
                    <Smile className="h-3 w-3 mr-1" />
                    {moodAnalysis.mood_score}/10 - {moodAnalysis.primary_emotion}
                  </Badge>
                </div>
                {moodAnalysis.themes && (
                  <div className="flex flex-wrap gap-1">
                    {moodAnalysis.themes.map((theme: string) => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
                {moodAnalysis.insight && (
                  <p className="text-sm text-muted-foreground italic">
                    💡 {moodAnalysis.insight}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWriting(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} disabled={!newEntry.content.trim()}>
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEntry.title || 'Untitled Entry'}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedEntry.id)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${selectedEntry.is_favorite ? 'fill-pink-400 text-pink-400' : ''}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEntryToDelete(selectedEntry.id);
                        setSelectedEntry(null);
                      }}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedEntry.created_at), 'MMMM d, yyyy h:mm a')}
                </div>

                {selectedEntry.ai_prompt && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
                    <p className="text-sm italic">"{selectedEntry.ai_prompt}"</p>
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>

                {selectedEntry.mood_score && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mood:</span>
                    <Badge className={getMoodColor(selectedEntry.mood_score)}>
                      {moodEmojis[selectedEntry.mood_score - 1]} {selectedEntry.mood_score}/10
                    </Badge>
                  </div>
                )}

                {selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
