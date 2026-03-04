import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Flag, Users, Activity, Ban, FileText, MessageSquare } from "lucide-react";
import { useAdminRole, useCommunityStats } from "@/hooks/useAdmin";
import { ReportsPanel } from "./ReportsPanel";
import { BansPanel } from "./BansPanel";
import { ModerationLogsPanel } from "./ModerationLogsPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import { Loader2 } from "lucide-react";

export const AdminDashboard = () => {
  const { data: role, isLoading: roleLoading } = useAdminRole();
  const { data: stats, isLoading: statsLoading } = useCommunityStats();
  const [activeTab, setActiveTab] = useState("overview");

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role?.isModerator) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl gradient-primary">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {role.isAdmin ? "Administrator" : "Moderator"} Access
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          loading={statsLoading}
        />
        <StatsCard
          icon={FileText}
          label="Forum Posts"
          value={stats?.totalPosts || 0}
          loading={statsLoading}
        />
        <StatsCard
          icon={Flag}
          label="Total Reports"
          value={stats?.totalReports || 0}
          loading={statsLoading}
        />
        <StatsCard
          icon={Activity}
          label="Pending"
          value={stats?.pendingReports || 0}
          loading={statsLoading}
          highlight={stats?.pendingReports ? stats.pendingReports > 0 : false}
        />
        <StatsCard
          icon={Ban}
          label="Active Bans"
          value={stats?.activeBans || 0}
          loading={statsLoading}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="bans" className="flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Bans
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ReportsPanel />
        </TabsContent>

        <TabsContent value="bans" className="mt-6">
          <BansPanel isAdmin={role.isAdmin} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackPanel />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ModerationLogsPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

const StatsCard = ({
  icon: Icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
}) => (
  <Card className={highlight ? "border-warning bg-warning/5" : ""}>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Icon
          className={`w-5 h-5 ${highlight ? "text-warning" : "text-muted-foreground"}`}
        />
        <div>
          <p className="text-2xl font-bold">
            {loading ? "..." : value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
