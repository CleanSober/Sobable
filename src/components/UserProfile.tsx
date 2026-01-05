import { useState } from "react";
import { RotateCcw, Settings2, Phone, DollarSign, Calendar, User } from "lucide-react";
import { getUserData, saveUserData } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const UserProfile = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState(getUserData());
  
  const [name, setName] = useState(userData?.name || "");
  const [sobrietyDate, setSobrietyDate] = useState(userData?.sobrietyStartDate || "");
  const [dailySpending, setDailySpending] = useState(userData?.dailySpending?.toString() || "0");
  const [sponsorPhone, setSponsorPhone] = useState(userData?.sponsorPhone || "");
  const [emergencyContact, setEmergencyContact] = useState(userData?.emergencyContact || "");
  const [personalReminder, setPersonalReminder] = useState(userData?.personalReminder || "");

  const displayName = userData?.name || "Friend";
  const initials = userData?.name ? userData.name.slice(0, 2).toUpperCase() : "ME";

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveSettings = () => {
    if (!userData) return;
    
    const spending = parseFloat(dailySpending) || 0;
    if (spending < 0 || spending > 10000) {
      toast.error("Daily spending must be between $0 and $10,000");
      return;
    }

    const updatedData = {
      ...userData,
      name: name.trim().slice(0, 50) || undefined,
      sobrietyStartDate: sobrietyDate,
      dailySpending: spending,
      sponsorPhone: sponsorPhone.slice(0, 20),
      emergencyContact: emergencyContact.slice(0, 20),
      personalReminder: personalReminder.slice(0, 500),
    };
    
    saveUserData(updatedData);
    setUserData(updatedData);
    setIsSettingsOpen(false);
    toast.success("Settings saved successfully!");
    
    // Reload to update all components with new data
    setTimeout(() => window.location.reload(), 500);
  };

  const openSettings = () => {
    // Refresh data when opening
    const freshData = getUserData();
    setUserData(freshData);
    setName(freshData?.name || "");
    setSobrietyDate(freshData?.sobrietyStartDate || "");
    setDailySpending(freshData?.dailySpending?.toString() || "0");
    setSponsorPhone(freshData?.sponsorPhone || "");
    setEmergencyContact(freshData?.emergencyContact || "");
    setPersonalReminder(freshData?.personalReminder || "");
    setIsSettingsOpen(true);
  };

  return (
    <>
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
            <span className="text-sm font-medium text-foreground hidden sm:inline truncate max-w-[80px]">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Your recovery journey</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openSettings} className="cursor-pointer">
            <Settings2 className="w-4 h-4 mr-2" />
            Edit Settings
          </DropdownMenuItem>
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

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Profile Settings</SheetTitle>
            <SheetDescription>
              Update your recovery journey details
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Display Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Leave empty for anonymous"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to stay anonymous
              </p>
            </div>

            {/* Sobriety Date */}
            <div className="space-y-2">
              <Label htmlFor="sobrietyDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Sobriety Start Date
              </Label>
              <Input
                id="sobrietyDate"
                type="date"
                value={sobrietyDate}
                onChange={(e) => setSobrietyDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Daily Spending */}
            <div className="space-y-2">
              <Label htmlFor="dailySpending" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Daily Spending (before sobriety)
              </Label>
              <Input
                id="dailySpending"
                type="number"
                min="0"
                max="10000"
                step="0.01"
                value={dailySpending}
                onChange={(e) => setDailySpending(e.target.value)}
                placeholder="e.g., 15"
              />
              <p className="text-xs text-muted-foreground">
                How much you used to spend daily on your habit
              </p>
            </div>

            {/* Emergency Contacts Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Emergency Contacts
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsorPhone">Sponsor Phone</Label>
                  <Input
                    id="sponsorPhone"
                    type="tel"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value.slice(0, 20))}
                    placeholder="e.g., 555-123-4567"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value.slice(0, 20))}
                    placeholder="e.g., 555-987-6543"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            {/* Personal Reminder */}
            <div className="space-y-2">
              <Label htmlFor="personalReminder">Personal Reminder</Label>
              <Input
                id="personalReminder"
                value={personalReminder}
                onChange={(e) => setPersonalReminder(e.target.value.slice(0, 500))}
                placeholder="Why I'm doing this..."
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                A personal message to remind you why you started
              </p>
            </div>

            {/* Save Button */}
            <Button onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
