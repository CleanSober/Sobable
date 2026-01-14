import { useState, useRef, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AtSign } from "lucide-react";
import { getDisplayName, getAvatarColor, getInitials } from "@/lib/anonymousNames";
import { UserProfile } from "@/hooks/useCommunity";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  profiles: UserProfile[];
  className?: string;
  multiline?: boolean;
  rows?: number;
  "aria-label"?: string;
}

export const MentionInput = memo(({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  maxLength,
  profiles,
  className = "",
  multiline = false,
  rows = 1,
  "aria-label": ariaLabel,
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Find mention being typed
  const findMentionQuery = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf("@");
    
    if (lastAtIndex === -1) return null;
    
    // Check if @ is at start or preceded by space
    if (lastAtIndex > 0 && beforeCursor[lastAtIndex - 1] !== " ") return null;
    
    const query = beforeCursor.slice(lastAtIndex + 1);
    
    // Check if there's a space after the query (mention completed)
    if (query.includes(" ")) return null;
    
    return { start: lastAtIndex, query };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);

    const mention = findMentionQuery(newValue, cursorPos);
    
    if (mention && mention.query.length >= 1) {
      setMentionStart(mention.start);
      const filtered = profiles.filter((p) => {
        const displayName = getDisplayName(p.display_name, p.user_id);
        return displayName.toLowerCase().includes(mention.query.toLowerCase());
      }).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  const insertMention = useCallback((profile: UserProfile) => {
    if (mentionStart === null) return;
    
    const displayName = getDisplayName(profile.display_name, profile.user_id);
    const before = value.slice(0, mentionStart);
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const after = value.slice(cursorPos);
    
    const newValue = `${before}@${displayName} ${after}`;
    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = mentionStart + displayName.length + 2;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [mentionStart, value, onChange]);

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
    
    onKeyDown?.(e);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    if (showSuggestions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSuggestions]);

  const InputComponent = multiline ? "textarea" : "input";

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef as any}
        type={multiline ? undefined : "text"}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        aria-label={ariaLabel}
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${multiline ? "min-h-[80px] resize-none" : "h-10"} ${className}`}
      />
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
            role="listbox"
          >
            {suggestions.map((profile, index) => {
              const displayName = getDisplayName(profile.display_name, profile.user_id);
              return (
                <button
                  key={profile.user_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    insertMention(profile);
                  }}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(profile.user_id)}`}
                  >
                    {getInitials(displayName)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AtSign className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MentionInput.displayName = "MentionInput";

// Utility component to render text with highlighted mentions
export const MentionText = memo(({ text, className = "" }: { text: string; className?: string }) => {
  const parts = text.split(/(@\w+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          return (
            <span
              key={index}
              className="text-primary font-medium bg-primary/10 px-1 rounded"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
});

MentionText.displayName = "MentionText";
