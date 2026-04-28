import { cn, confidenceColor, confidenceBg } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface Props {
  score: number;
}

export default function ConfidenceBadge({ score }: Props) {
  const pct = Math.round(score * 100);
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium", confidenceBg(score))}>
      <ShieldCheck size={14} className={confidenceColor(score)} />
      <span className={confidenceColor(score)}>{pct}% confidence</span>
    </div>
  );
}
