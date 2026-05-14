import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export type ExportFormat = "json" | "pdf";

export interface ExportPayload {
  exported_at: string;
  user_id: string;
  journal_entries: any[];
  mood_entries: any[];
  trigger_entries: any[];
  daily_goals: any[];
}

export async function fetchUserHistory(userId: string): Promise<ExportPayload> {
  const [journal, mood, trigger, goals] = await Promise.all([
    supabase.from("journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("mood_entries").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("trigger_entries").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("daily_goals").select("*").eq("user_id", userId).order("date", { ascending: false }),
  ]);

  if (journal.error) throw journal.error;
  if (mood.error) throw mood.error;
  if (trigger.error) throw trigger.error;
  if (goals.error) throw goals.error;

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    journal_entries: journal.data || [],
    mood_entries: mood.data || [],
    trigger_entries: trigger.data || [],
    daily_goals: goals.data || [],
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJSON(data: ExportPayload) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, `sober-club-export-${new Date().toISOString().split("T")[0]}.json`);
}

export function exportAsPDF(data: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (lines: number, lineHeight = 14) => {
    if (y + lines * lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLine = (text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 11);
    doc.setTextColor(...(opts.color ?? [20, 20, 20]));
    const wrapped = doc.splitTextToSize(text, maxWidth);
    ensureSpace(wrapped.length, (opts.size ?? 11) + 3);
    doc.text(wrapped, margin, y);
    y += wrapped.length * ((opts.size ?? 11) + 3);
  };

  const sectionHeader = (title: string, count: number) => {
    y += 10;
    ensureSpace(2, 18);
    writeLine(`${title} (${count})`, { size: 16, bold: true, color: [40, 40, 80] });
    y += 4;
  };

  // Title
  writeLine("Sober Club — Personal Data Export", { size: 20, bold: true, color: [30, 30, 30] });
  writeLine(`Exported: ${new Date(data.exported_at).toLocaleString()}`, { size: 10, color: [110, 110, 110] });

  // Journal
  sectionHeader("Journal Entries", data.journal_entries.length);
  if (data.journal_entries.length === 0) writeLine("No entries.", { color: [130, 130, 130] });
  data.journal_entries.forEach((e) => {
    const date = new Date(e.created_at).toLocaleString();
    writeLine(`${e.title || "Untitled"} — ${date}`, { bold: true, size: 12 });
    if (e.mood_score != null) writeLine(`Mood: ${e.mood_score}/10`, { size: 10, color: [110, 110, 110] });
    if (e.tags?.length) writeLine(`Tags: ${e.tags.join(", ")}`, { size: 10, color: [110, 110, 110] });
    writeLine(e.content || "");
    y += 6;
  });

  // Mood
  sectionHeader("Mood Check-ins", data.mood_entries.length);
  if (data.mood_entries.length === 0) writeLine("No entries.", { color: [130, 130, 130] });
  data.mood_entries.forEach((m) => {
    writeLine(`${m.date} — Mood ${m.mood}/10, Craving ${m.craving_level}/10${m.note ? ` — ${m.note}` : ""}`);
  });

  // Triggers
  sectionHeader("Trigger Logs", data.trigger_entries.length);
  if (data.trigger_entries.length === 0) writeLine("No entries.", { color: [130, 130, 130] });
  data.trigger_entries.forEach((t) => {
    writeLine(`${t.date} ${t.time} — ${t.trigger} (intensity ${t.intensity}/10)`, { bold: true, size: 11 });
    writeLine(`Situation: ${t.situation || "—"}  •  Emotion: ${t.emotion || "—"}`, { size: 10, color: [90, 90, 90] });
    if (t.coping_used) writeLine(`Coping: ${t.coping_used}`, { size: 10, color: [90, 90, 90] });
    if (t.outcome) writeLine(`Outcome: ${t.outcome}`, { size: 10, color: [90, 90, 90] });
    if (t.notes) writeLine(`Notes: ${t.notes}`, { size: 10, color: [90, 90, 90] });
    y += 4;
  });

  // Daily goals
  sectionHeader("Daily Check-in History", data.daily_goals.length);
  if (data.daily_goals.length === 0) writeLine("No entries.", { color: [130, 130, 130] });
  data.daily_goals.forEach((g) => {
    const done = [
      g.mood_logged && "mood",
      g.trigger_logged && "trigger",
      g.meditation_done && "meditation",
      g.journal_written && "journal",
    ].filter(Boolean).join(", ") || "none";
    writeLine(`${g.date} — completed: ${done}`);
  });

  doc.save(`sober-club-export-${new Date().toISOString().split("T")[0]}.pdf`);
}

export async function exportUserData(userId: string, format: ExportFormat) {
  const data = await fetchUserHistory(userId);
  if (format === "json") exportAsJSON(data);
  else exportAsPDF(data);
  return data;
}
