import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Flag,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  MessageSquare,
  FileText,
} from "lucide-react";
import {
  useContentReports,
  useUpdateReport,
  useDeleteContent,
  useBanUser,
} from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import { generateAnonymousName } from "@/lib/anonymousNames";

type StatusFilter = "all" | "pending" | "reviewed" | "dismissed" | "actioned";

export const ReportsPanel = () => {
  const { data: reports, isLoading } = useContentReports();
  const updateReport = useUpdateReport();
  const deleteContent = useDeleteContent();
  const banUser = useBanUser();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const filteredReports = reports?.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
            Reviewed
          </Badge>
        );
      case "dismissed":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Dismissed
          </Badge>
        );
      case "actioned":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Actioned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "forum_post":
        return <FileText className="w-4 h-4" />;
      case "forum_reply":
      case "chat_message":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAction = async (
    reportId: string,
    action: "dismiss" | "delete" | "ban",
    targetType?: string,
    targetId?: string,
    reportedUserId?: string
  ) => {
    if (action === "dismiss") {
      await updateReport.mutateAsync({ reportId, status: "dismissed" });
    } else if (action === "delete" && targetType && targetId) {
      await deleteContent.mutateAsync({
        targetType: targetType as "forum_post" | "forum_reply" | "chat_message",
        targetId,
      });
      await updateReport.mutateAsync({ reportId, status: "actioned" });
    } else if (action === "ban" && reportedUserId) {
      await banUser.mutateAsync({
        userId: reportedUserId,
        reason: "Violated community guidelines",
        isPermanent: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
      await updateReport.mutateAsync({ reportId, status: "actioned" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Content Reports
        </CardTitle>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="actioned">Actioned</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {!filteredReports?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reports to show</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTargetIcon(report.target_type)}
                      <span className="font-medium capitalize">
                        {report.target_type.replace("_", " ")}
                      </span>
                      {getStatusBadge(report.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Reason: </span>
                      <span className="font-medium">{report.reason}</span>
                    </div>

                    {report.description && (
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Reported by:{" "}
                      <span className="font-medium">
                        {generateAnonymousName(report.reporter_id)}
                      </span>
                      {" • "}
                      Against:{" "}
                      <span className="font-medium">
                        {generateAnonymousName(report.reported_user_id)}
                      </span>
                    </div>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(report.id, "dismiss")}
                        disabled={updateReport.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Content?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the reported content.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleAction(
                                  report.id,
                                  "delete",
                                  report.target_type,
                                  report.target_id
                                )
                              }
                            >
                              Delete Content
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};
