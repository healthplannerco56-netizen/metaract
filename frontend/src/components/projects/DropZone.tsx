"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function DropZone({ onUpload, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [queued, setQueued] = useState<File[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    const pdfs = accepted.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdfs.length) return;
    setQueued(pdfs);
    for (const file of pdfs) {
      setUploading(true);
      await onUpload(file);
      setUploading(false);
    }
    setQueued([]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled: disabled || uploading,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
        isDragActive
          ? "border-clinical-500 bg-clinical-500/5"
          : "border-slate-700 hover:border-slate-600 bg-slate-800/30",
        (disabled || uploading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-clinical-400 animate-spin" />
          <div className="text-sm text-slate-400">
            Uploading {queued.map(f => f.name).join(", ")}...
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Upload size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              {isDragActive ? "Drop PDFs here" : "Drop research PDFs here"}
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse · PDF only · max 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
