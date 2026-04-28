import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function confidenceColor(score: number): string {
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.6) return "text-yellow-400";
  return "text-red-400";
}

export function confidenceBg(score: number): string {
  if (score >= 0.8) return "bg-emerald-400/10 border-emerald-400/30";
  if (score >= 0.6) return "bg-yellow-400/10 border-yellow-400/30";
  return "bg-red-400/10 border-red-400/30";
}

export function statusColor(status: string): string {
  switch (status) {
    case "extracted": return "text-emerald-400 bg-emerald-400/10";
    case "processing": return "text-blue-400 bg-blue-400/10";
    case "uploaded": return "text-slate-400 bg-slate-400/10";
    case "error": return "text-red-400 bg-red-400/10";
    default: return "text-slate-400 bg-slate-400/10";
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
