import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Calendar, DollarSign, Phone, LogOut, Bell, FileText, Camera, Loader2, Zap, ArrowLeft, Settings2, Shield, Crown, ChevronRight, Mail
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useGamification, getLevelTitle } from "@/hooks/useGamification";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import NotificationSettings from "@/components/NotificationSettings";
import TermsAndConditions from "@/components/TermsAndConditions";
import { BottomTabs, type TabId } from "@/components/BottomTabs";
import { calculateDaysSober } from "@/lib/storage";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, refetch, loading: profileLoading } = useUserData();
  const { userXP } = useGamification();
  const { isPremium } = usePremiumStatus();
  const { openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const [name, setName] = useState("");
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [dailySpending, setDailySpending] = useState("0");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

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
  const currentLevel = userXP?.current_level || 1;
  const totalXP = userXP?.total_xp || 0;
  const daysSober = profile?.sobriety_start_date ? calculateDaysSober(profile.sobriety_start_date) : 0;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

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
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

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

  const handleSave = async () => {
    const spending = parseFloat(dailySpending) || 0;
    if (spending < 0 || spending > 10000) {
      toast.error("Daily spending must be between $0 and $10,000");
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      display_name: name.trim().slice(0, 50) || null,
      sobriety_start_date: sobrietyDate || null,
      daily_spending: spending,
      sponsor_phone: sponsorPhone.slice(0, 20) || null,
      emergency_contact: emergencyContact.slice(0, 20) || null,
      personal_reminder: personalReminder.slice(0, 500) || null,
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background noise-overlay">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 safe-area-top"
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
        <div className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 py-2 flex items-center gap-3 relative">
          <button
            onClick={() => navigate("/app")}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">Profile</h1>
        </div>
      </motion.header>

      <main className="container max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-6 py-4 pb-24 relative">
        <div className="space-y-4">
          {/* Profile Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-enhanced p-5 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-primary/30 shadow-lg shadow-primary/10">
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
              <div>
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 w-full mt-2">
                <div className="stat-box text-center py-2">
                  <p className="text-lg font-bold text-foreground">{daysSober}</p>
                  <p className="text-[10px] text-muted-foreground">Days Sober</p>
                </div>
                <div className="stat-box text-center py-2">
                  <p className="text-lg font-bold text-primary">{currentLevel}</p>
                  <p className="text-[10px] text-muted-foreground">{getLevelTitle(currentLevel)}</p>
                </div>
                <div className="stat-box text-center py-2">
                  <p className="text-lg font-bold text-accent">{totalXP.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Total XP</p>
                </div>
              </div>

              {/* Premium badge */}
              {isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/15 to-primary/15 border border-accent/25">
                  <Crown className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">Sober Club Premium</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-enhanced overflow-hidden"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
            >
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground flex-1">Change Photo</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="h-px bg-border/30 mx-4" />
            {isPremium && (
              <>
                <button
                  onClick={openCustomerPortal}
                  className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
                >
                  <Crown className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-foreground flex-1">Manage Subscription</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="h-px bg-border/30 mx-4" />
              </>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive flex-1">Sign Out</span>
            </button>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Profile Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-primary" />
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
                <Label htmlFor="sobrietyDate" className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
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
                <Label htmlFor="dailySpending" className="flex items-center gap-2 text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
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

              <div className="space-y-2">
                <Label htmlFor="personalReminder" className="flex items-center gap-2 text-xs">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Personal Reminder
                </Label>
                <Input
                  id="personalReminder"
                  value={personalReminder}
                  onChange={(e) => setPersonalReminder(e.target.value.slice(0, 500))}
                  placeholder="Why I'm doing this..."
                  maxLength={500}
                />
              </div>
            </div>
          </motion.div>

          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Emergency Contacts
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sponsorPhone" className="text-xs">Sponsor Phone</Label>
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
                <Label htmlFor="emergencyContact" className="text-xs">Emergency Contact</Label>
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
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
            </h3>
            <NotificationSettings sobrietyStartDate={sobrietyDate} />
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Legal
            </h3>
            <TermsAndConditions />
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </motion.div>
        </div>
      </main>

      <BottomTabs activeTab={activeTab} onTabChange={(tab) => {
        navigate("/app");
      }} />
    </div>
  );
};

export default Profile;
