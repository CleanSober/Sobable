import { useState, useEffect, useRef } from "react";
import { RotateCcw, Settings2, Phone, DollarSign, Calendar, User, LogOut, Bell, FileText, Camera, Loader2, Zap } from "lucide-react";
import NotificationSettings from "@/components/NotificationSettings";
import TermsAndConditions from "@/components/TermsAndConditions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useGamification, getLevelTitle } from "@/hooks/useGamification";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, refetch } = useUserData();
  const { userXP } = useGamification();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [dailySpending, setDailySpending] = useState("0");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setSobrietyDate(profile.sobriety_start_date || "");
      setDailySpending(profile.daily_spending?.toString() || "0");
      setSponsorPhone(profile.sponsor_phone || "");
      setEmergencyContact(profile.emergency_contact || "");
      setPersonalReminder(profile.personal_reminder || "");
      setAvatarUrl((profile as any).avatar_url || null);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refetch();
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
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
      setAvatarUrl((profile as any).avatar_url || null);
    }
    setIsSettingsOpen(true);
  };

  const currentLevel = userXP?.current_level || 1;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
            aria-label="User profile"
          >
            <div className="relative">
              <Avatar className="w-8 h-8 border-2 border-primary/30">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Level Badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-background">
                {currentLevel}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                Lvl {currentLevel}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Level {currentLevel} • {getLevelTitle(currentLevel)}
                  </span>
                </div>
              </div>
            </div>
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
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                {/* Level Badge on Avatar */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-background">
                  {currentLevel}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="text-center">
                <p className="text-sm font-medium">{getLevelTitle(currentLevel)}</p>
                <p className="text-xs text-muted-foreground">Level {currentLevel}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </>
                )}
              </Button>
            </div>

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

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notifications
              </h3>
              <NotificationSettings sobrietyStartDate={sobrietyDate} />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Legal
              </h3>
              <TermsAndConditions />
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