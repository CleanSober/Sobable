import { useState } from "react";
import { User, LogOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserData } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const UserProfile = () => {
  const userData = getUserData();
  const userName = "You";
  const initials = "ME";

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          aria-label="User profile"
        >
          <Avatar className="w-7 h-7 border-2 border-primary/30">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            {userName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">Your recovery journey</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleResetProgress}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Progress
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
