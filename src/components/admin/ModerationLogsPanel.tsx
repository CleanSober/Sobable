import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Loader2,
  Ban,
  Trash2,
  UserCheck,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useModerationLogs } from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import { generateAnonymousName } from "@/lib/anonymousNames";

export const ModerationLogsPanel = () => {
  const { data: logs, isLoading } = useModerationLogs();

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ban_user":
        return <Ban className="w-4 h-4 text-destructive" />;
      case "unban_user":
        return <UserCheck className="w-4 h-4 text-primary" />;
      case "delete_content":
        return <Trash2 className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "forum_post":
        return <FileText className="w-3 h-3" />;
      case "forum_reply":
      case "chat_message":
        return <MessageSquare className="w-3 h-3" />;
      case "user":
        return <Ban className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "ban_user":
        return "Banned User";
      case "unban_user":
        return "Unbanned User";
      case "delete_content":
        return "Deleted Content";
      default:
        return action.replace("_", " ");
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Moderation Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!logs?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No moderation activity yet</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card/30"
            >
              <div className="mt-0.5">{getActionIcon(log.action_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {getActionLabel(log.action_type)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    {getTargetIcon(log.target_type)}
                    {log.target_type.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  By{" "}
                  <span className="font-medium">
                    {generateAnonymousName(log.moderator_id)}
                  </span>
                  {" • "}
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                  })}
                </p>
                {log.details &&
                  typeof log.details === "object" &&
                  Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
