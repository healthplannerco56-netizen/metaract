"use client";
import Link from "next/link";
import { FileText, Trash2, Zap, CheckCircle, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { cn, statusColor, formatDate } from "@/lib/utils";
import type { Study } from "@/types";

interface Props {
  study: Study;
  projectId: string;
  onDelete: (id: string) => void;
}

const statusIcon = {
  uploaded: FileText,
  processing: Loader2,
  extracted: CheckCircle,
  error: AlertCircle,
};

export default function StudyRow({ study, projectId, onDelete }: Props) {
  const Icon = statusIcon[study.status] || FileText;

  return (
    <div className="card px-4 py-3.5 flex items-center gap-3 group hover:border-slate-700 transition-colors">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", statusColor(study.status))}>
        <Icon
          size={15}
          className={study.status === "processing" ? "animate-spin" : ""}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{study.file_name}</p>
        <p className="text-xs text-slate-500">
          {study.page_count ? `${study.page_count} pages · ` : ""}
          {formatDate(study.created_at)}
        </p>
      </div>

      <span className={cn("badge text-xs shrink-0", statusColor(study.status))}>
        {study.status}
      </span>

      <button
        onClick={() => onDelete(study.id)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={13} />
      </button>

      <Link
        href={`/projects/${projectId}/extract/${study.id}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-600/10 hover:bg-clinical-600/20 text-clinical-400 text-xs font-medium transition-colors border border-clinical-600/20 shrink-0"
      >
        <Zap size={12} />
        {study.status === "extracted" ? "View" : "Extract"}
        <ChevronRight size={11} />
      </Link>
    </div>
  );
}
