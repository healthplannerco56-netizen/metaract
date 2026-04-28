"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Zap, Loader2, FileText, RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ExtractionForm from "@/components/extraction/ExtractionForm";
import { useExtractionStore } from "@/store/extractionStore";
import { useProjectStore } from "@/store/projectStore";
import { studiesApi } from "@/lib/api";
import type { Study, ExtractionData } from "@/types";
import { cn } from "@/lib/utils";

export default function ExtractionPage() {
  const params = useParams<{ id: string; studyId: string }>();
  const { id: projectId, studyId } = params;

  const { extraction, extracting, saving, fetchExtraction, runExtraction, updateExtraction, clearExtraction } =
    useExtractionStore();
  const { currentProject, fetchProject } = useProjectStore();

  const [study, setStudy] = useState<Study | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("raw");

  useEffect(() => {
    clearExtraction();
    fetchProject(projectId);
    fetchExtraction(studyId);

    studiesApi.get(studyId).then((res) => {
      setStudy(res.data);
    });
  }, [studyId, projectId]);

  const handleSave = async (data: ExtractionData) => {
    await updateExtraction(studyId, data);
  };

  return (
    <AppShell>
      <div className="h-screen flex flex-col">
        {/* Top bar */}
        <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-6 py-3 flex items-center gap-4">
          <Link href={`/projects/${projectId}`} className="btn-ghost -ml-2">
            <ChevronLeft size={15} />
            {currentProject?.name || "Project"}
          </Link>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <FileText size={14} />
            <span className="text-slate-200 truncate max-w-xs">{study?.file_name}</span>
            {study?.page_count && (
              <span className="text-slate-600">· {study.page_count}p</span>
            )}
          </div>
          <div className="flex-1" />
          <button
            onClick={() => runExtraction(studyId)}
            disabled={extracting}
            className={cn(
              "btn-primary",
              extraction ? "btn-secondary" : "btn-primary"
            )}
          >
            {extracting ? (
              <><Loader2 size={14} className="animate-spin" /> Extracting...</>
            ) : extraction ? (
              <><RefreshCw size={14} /> Re-extract</>
            ) : (
              <><Zap size={14} /> Run AI Extraction</>
            )}
          </button>
        </div>

        {/* Split screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: PDF / Text viewer */}
          <div className="w-1/2 border-r border-slate-800 flex flex-col">
            <div className="shrink-0 px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Source Document</span>
              <div className="flex gap-1 ml-auto">
                {(["raw"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition-colors",
                      activeTab === tab
                        ? "bg-slate-700 text-slate-200"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Raw Text
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {study ? (
                <div className="font-mono text-xs text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                  {/* We show the raw text via a second API call */}
                  <RawTextLoader studyId={studyId} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="animate-spin text-clinical-400" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Extraction form */}
          <div className="w-1/2 flex flex-col">
            <div className="shrink-0 px-4 py-2.5 border-b border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Extracted Data
              </span>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              {extracting ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-clinical-500/20 flex items-center justify-center">
                      <Loader2 size={28} className="animate-spin text-clinical-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300 mb-1">AI Extraction in progress</p>
                    <p className="text-xs text-slate-500">Claude is reading your research paper...</p>
                  </div>
                </div>
              ) : extraction ? (
                <ExtractionForm
                  data={extraction.json_data}
                  confidenceScore={extraction.confidence_score}
                  validationIssues={extraction.validation_issues || []}
                  saving={saving}
                  onSave={handleSave}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Zap size={22} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">No extraction yet</p>
                    <p className="text-xs text-slate-600">Click "Run AI Extraction" to extract structured data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Lazy-loads raw text from the study
function RawTextLoader({ studyId }: { studyId: string }) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We use the internal API which returns the study with raw_text
    // For the MVP, we'll pull it from a direct backend call
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/study-detail/${studyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        // raw_text is not in StudyOut by default, but we can add a special endpoint
        // For now use file_name as placeholder or we store in study detail
        setText(data.raw_text || "Raw text not available. The document has been processed and chunked for extraction.");
        setLoading(false);
      })
      .catch(() => {
        setText("Could not load document text.");
        setLoading(false);
      });
  }, [studyId]);

  if (loading) return <Loader2 size={16} className="animate-spin text-slate-600" />;
  return <>{text}</>;
}
