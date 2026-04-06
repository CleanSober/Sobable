import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Calendar as CalendarIcon, DollarSign, Phone, LogOut, Bell, FileText, Camera, Loader2, Zap, ArrowLeft, Settings2, Shield, Crown, ChevronRight, Mail, Sun, Moon, Trash2, AlertTriangle, Eye, Save
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useGamification, getLevelTitle } from "@/hooks/useGamification";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import NotificationSettings from "@/components/NotificationSettings";
import TermsAndConditions from "@/components/TermsAndConditions";
import { FeedbackRating } from "@/components/FeedbackRating";
import { BottomTabs, type TabId } from "@/components/BottomTabs";
import { Switch } from "@/components/ui/switch";
import { calculateDaysSober } from "@/lib/storage";
import { applyThemePreference } from "@/lib/theme";
import cleanAndSoberLogo from "@/assets/clean-and-sober-logo.png";

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
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const [name, setName] = useState("");
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [dailySpending, setDailySpending] = useState("0");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [personalReminder, setPersonalReminder] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return !document.documentElement.classList.contains("light");
  });
  const [isColorblind, setIsColorblind] = useState(() => {
    return document.documentElement.classList.contains("colorblind");
  });

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;

      toast.success("Account deleted successfully");
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteConfirmText("");
    }
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
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1">Profile</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gradient-primary text-primary-foreground gap-1.5"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : "Save"}
          </Button>
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
                <Avatar className="w-20 h-20 border-[3px] border-primary/30 shadow-lg shadow-primary/10">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-background">
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
                <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              {/* Premium badge */}
              {isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-accent/15 to-primary/15 border border-accent/25">
                  <Crown className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">Sober Club</span>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 w-full mt-1">
                <div className="rounded-xl bg-secondary/50 border border-border/30 text-center py-2.5 px-1">
                  <p className="text-base font-bold text-foreground">{daysSober}</p>
                  <p className="text-[10px] text-muted-foreground">Days Sober</p>
                </div>
                <div className="rounded-xl bg-secondary/50 border border-border/30 text-center py-2.5 px-1">
                  <p className="text-base font-bold text-primary">{currentLevel}</p>
                  <p className="text-[10px] text-muted-foreground">{getLevelTitle(currentLevel)}</p>
                </div>
                <div className="rounded-xl bg-secondary/50 border border-border/30 text-center py-2.5 px-1">
                  <p className="text-base font-bold text-accent">{totalXP.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Total XP</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Profile Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-xs">
                  <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                  Sobriety Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !sobrietyDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {sobrietyDate
                        ? format(new Date(sobrietyDate + "T00:00:00"), "PPP")
                        : "Pick your start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sobrietyDate ? new Date(sobrietyDate + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(2, "0");
                          const dd = String(date.getDate()).padStart(2, "0");
                          setSobrietyDate(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
            transition={{ delay: 0.15 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Emergency Contacts
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sponsorPhone" className="flex items-center gap-2 text-xs">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Sponsor Phone
                </Label>
                <Input
                  id="sponsorPhone"
                  type="tel"
                  value={sponsorPhone}
                  onChange={(e) => setSponsorPhone(e.target.value.slice(0, 20))}
                  placeholder="e.g., 555-123-4567"
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContact" className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Emergency Contact
                </Label>
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

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
              Appearance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    {isDarkMode ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{isDarkMode ? "Dark Mode" : "Light Mode"}</p>
                    <p className="text-[10px] text-muted-foreground">Toggle between dark and light</p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(checked) => {
                    setIsDarkMode(checked);
                    if (checked) {
                      localStorage.setItem("theme", "dark");
                    } else {
                      localStorage.setItem("theme", "light");
                    }
                    applyThemePreference(checked ? "dark" : "light");
                  }}
                />
              </div>

              <div className="h-px bg-border/30" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Eye className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Colorblind Mode</p>
                    <p className="text-[10px] text-muted-foreground">High-contrast colors</p>
                  </div>
                </div>
                <Switch
                  checked={isColorblind}
                  onCheckedChange={(checked) => {
                    setIsColorblind(checked);
                    if (checked) {
                      document.documentElement.classList.add("colorblind");
                      localStorage.setItem("colorblind", "true");
                    } else {
                      document.documentElement.classList.remove("colorblind");
                      localStorage.setItem("colorblind", "false");
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
            </h3>
            <NotificationSettings sobrietyStartDate={sobrietyDate} />
          </motion.div>

          {/* Follow Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-enhanced p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <img src={cleanAndSoberLogo} alt="Clean & Sober" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Clean & Sober</h3>
                <p className="text-[10px] text-muted-foreground">Follow us for daily inspiration</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/clean.andsober/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white text-xs font-semibold transition-transform hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/CleanaandSober"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-semibold transition-transform hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            </div>
          </motion.div>

          {/* Feedback */}
          <FeedbackRating />

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card-enhanced p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Legal
            </h3>
            <TermsAndConditions />
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-enhanced overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-foreground p-4 pb-2 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              Account
            </h3>
            {isPremium && (
              <>
                <button
                  onClick={openCustomerPortal}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
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
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground flex-1">Sign Out</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="h-px bg-border/30 mx-4" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors text-left">
                  <Trash2 className="w-5 h-5 text-destructive/70" />
                  <span className="text-sm font-medium text-destructive/70 flex-1">Delete Account</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account Permanently
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>This action is <strong className="text-foreground">irreversible</strong>. All your data will be permanently deleted, including:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>Sobriety progress & streaks</li>
                      <li>Journal entries & mood logs</li>
                      <li>Community posts & messages</li>
                      <li>Subscription & Sober Club features</li>
                    </ul>
                    <div className="pt-2">
                      <Label htmlFor="deleteConfirm" className="text-xs text-muted-foreground">
                        Type <strong className="text-foreground">DELETE</strong> to confirm
                      </Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="mt-1.5"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete My Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>

          {/* Version */}
          <p className="text-center text-[10px] text-muted-foreground/50 py-2">
            Sober Club v1.0 · Made with 💚
          </p>
        </div>
      </main>

      <BottomTabs activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        navigate("/");
      }} />
    </div>
  );
};

export default Profile;
