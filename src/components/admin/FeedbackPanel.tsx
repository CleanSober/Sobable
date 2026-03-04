import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Filter, Download, MessageSquare } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

interface FeedbackRow {
  id: string;
  user_id: string;
  rating: number;
  category: string | null;
  message: string | null;
  platform: string | null;
  created_at: string;
}

export const FeedbackPanel = () => {
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["admin-feedback", ratingFilter, categoryFilter],
    queryFn: async () => {
      let query = (supabase.from("feedback_submissions" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (ratingFilter !== "all") {
        query = query.eq("rating", parseInt(ratingFilter));
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FeedbackRow[];
    },
  });

  const avgRating = feedback?.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "—";

  const ratingCounts = [1, 2, 3, 4, 5].map(
    (r) => feedback?.filter((f) => f.rating === r).length || 0
  );
  const maxCount = Math.max(...ratingCounts, 1);

  const exportCSV = () => {
    if (!feedback?.length) return;
    const headers = "Rating,Category,Message,Platform,Date\n";
    const rows = feedback
      .map((f) =>
        [
          f.rating,
          f.category || "",
          `"${(f.message || "").replace(/"/g, '""')}"`,
          f.platform || "",
          new Date(f.created_at).toLocaleDateString(),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{feedback?.length ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{ratingCounts[4]}</p>
            <p className="text-xs text-muted-foreground">5-Star Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {ratingCounts[0] + ratingCounts[1]}
            </p>
            <p className="text-xs text-muted-foreground">Low Ratings (1-2)</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right font-medium">{r}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(ratingCounts[r - 1] / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-muted-foreground">{ratingCounts[r - 1]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters & Export */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={r.toString()}>
                {r} Star{r > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bug">Bug Report</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
            <SelectItem value="ui">Design / UI</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="app_store_review">App Store Review</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV} className="ml-auto gap-1.5 h-8 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Feedback list */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading feedback...</p>
      ) : !feedback?.length ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No feedback submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {feedback.map((f) => (
            <Card key={f.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    {f.category && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {f.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
                    {f.platform && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{f.platform}</Badge>}
                    <span>{timeAgo(f.created_at)}</span>
                  </div>
                </div>
                {f.message && (
                  <p className="text-sm text-foreground leading-relaxed">{f.message}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
