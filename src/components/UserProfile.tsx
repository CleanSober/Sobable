import { useState, useEffect } from "react";
import { RotateCcw, Settings2, Phone, DollarSign, Calendar, User, LogOut } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useUserData();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [dailySpending, setDailySpending] = useState("0");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setSobrietyDate(profile.sobriety_start_date || "");
      setDailySpending(profile.daily_spending?.toString() || "0");
      setSponsorPhone(profile.sponsor_phone || "");
      setEmergencyContact(profile.emergency_contact || "");
      setPersonalReminder(profile.personal_reminder || "");
    }
  }, [profile]);

  const displayName = profile?.display_name || "Friend";
  const initials = profile?.display_name 
    ? profile.display_name.slice(0, 2).toUpperCase() 
    : user?.email?.slice(0, 2).toUpperCase() || "ME";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleSaveSettings = async () => {
    const spending = parseFloat(dailySpending) || 0;
    if (spending < 0 || spending > 10000) {
      toast.error("Daily spending must be between $0 and $10,000");
      return;
    }

    const { error } = await updateProfile({
      display_name: name.trim().slice(0, 50) || null,
      sobriety_start_date: sobrietyDate || null,
      daily_spending: spending,
      sponsor_phone: sponsorPhone.slice(0, 20) || null,
      emergency_contact: emergencyContact.slice(0, 20) || null,
      personal_reminder: personalReminder.slice(0, 500) || null,
    });
    
    if (error) {
      toast.error("Failed to save settings");
    } else {
      setIsSettingsOpen(false);
      toast.success("Settings saved successfully!");
    }
  };

  const openSettings = () => {
    if (profile) {
      setName(profile.display_name || "");
      setSobrietyDate(profile.sobriety_start_date || "");
      setDailySpending(profile.daily_spending?.toString() || "0");
      setSponsorPhone(profile.sponsor_phone || "");
      setEmergencyContact(profile.emergency_contact || "");
      setPersonalReminder(profile.personal_reminder || "");
    }
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
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openSettings} className="cursor-pointer">
            <Settings2 className="w-4 h-4 mr-2" />
            Edit Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
            </div>

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
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="personalReminder">Personal Reminder</Label>
              <Input
                id="personalReminder"
                value={personalReminder}
                onChange={(e) => setPersonalReminder(e.target.value.slice(0, 500))}
                placeholder="Why I'm doing this..."
                maxLength={500}
              />
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
