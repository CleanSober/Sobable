import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood_score: number | null;
  mood_analysis: string | null;
  ai_prompt: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const useJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry: Partial<JournalEntry>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: entry.title || null,
          content: entry.content || '',
          mood_score: entry.mood_score || null,
          mood_analysis: entry.mood_analysis || null,
          ai_prompt: entry.ai_prompt || null,
          tags: entry.tags || [],
          is_favorite: entry.is_favorite || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setEntries(prev => [data, ...prev]);
      toast.success('Journal entry saved');
      return data;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast.error('Failed to save journal entry');
      return null;
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setEntries(prev => prev.map(e => e.id === id ? data : e));
      toast.success('Journal entry updated');
      return data;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast.error('Failed to update journal entry');
      return null;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Journal entry deleted');
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('Failed to delete journal entry');
      return false;
    }
  };

  const toggleFavorite = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    await updateEntry(id, { is_favorite: !entry.is_favorite });
  };

  const getAIPrompt = async (category: string = 'general', daysSober: number = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('journal-ai', {
        body: {
          action: 'generate_prompt',
          context: { category, daysSober },
        },
      });

      if (response.error) throw response.error;
      return response.data.result;
    } catch (error) {
      console.error('Error getting AI prompt:', error);
      return "What's on your mind today? Take a moment to reflect on your journey.";
    }
  };

  const analyzeMood = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('journal-ai', {
        body: {
          action: 'analyze_mood',
          content,
        },
      });

      if (response.error) throw response.error;
      return response.data.result;
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return null;
    }
  };

  const suggestTags = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('journal-ai', {
        body: {
          action: 'suggest_tags',
          content,
        },
      });

      if (response.error) throw response.error;
      return response.data.result;
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return [];
    }
  };

  const exportEntries = (format: 'json' | 'txt' | 'csv' = 'json') => {
    let content = '';
    let filename = `journal-export-${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'application/json';

    if (format === 'json') {
      content = JSON.stringify(entries, null, 2);
      filename += '.json';
    } else if (format === 'txt') {
      content = entries.map(entry => {
        const date = new Date(entry.created_at).toLocaleDateString();
        return `--- ${entry.title || 'Untitled'} (${date}) ---\n\n${entry.content}\n\nMood: ${entry.mood_score || 'N/A'}/10\nTags: ${entry.tags.join(', ') || 'None'}\n\n`;
      }).join('\n');
      filename += '.txt';
      mimeType = 'text/plain';
    } else if (format === 'csv') {
      const headers = ['Date', 'Title', 'Content', 'Mood Score', 'Tags'];
      const rows = entries.map(entry => [
        new Date(entry.created_at).toLocaleDateString(),
        entry.title || '',
        entry.content.replace(/"/g, '""'),
        entry.mood_score?.toString() || '',
        entry.tags.join('; '),
      ]);
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename += '.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Journal exported as ${format.toUpperCase()}`);
  };

  return {
    entries,
    loading,
    searchQuery,
    setSearchQuery,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    getAIPrompt,
    analyzeMood,
    suggestTags,
    exportEntries,
    refresh: fetchEntries,
  };
};
