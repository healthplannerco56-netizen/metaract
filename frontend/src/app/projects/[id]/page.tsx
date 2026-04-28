"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Loader2, BookOpen } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import DropZone from "@/components/projects/DropZone";
import StudyRow from "@/components/projects/StudyRow";
import { useProjectStore } from "@/store/projectStore";
import { exportApi } from "@/lib/api";
import { downloadBlob } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { currentProject, studies, loading, uploading, fetchProject, fetchStudies, uploadStudy, deleteStudy } =
    useProjectStore();

  useEffect(() => {
    fetchProject(projectId);
    fetchStudies(projectId);
  }, [projectId, fetchProject, fetchStudies]);

  const handleUpload = async (file: File) => {
    await uploadStudy(projectId, file);
  };

  const handleExport = async () => {
    try {
      toast.loading("Generating CSV...", { id: "export" });
      const res = await exportApi.csv(projectId);
      downloadBlob(res.data, `${currentProject?.name || "export"}.csv`);
      toast.success("CSV downloaded", { id: "export" });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Export failed", { id: "export" });
    }
  };

  const extractedCount = studies.filter((s) => s.status === "extracted").length;

  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        {/* Breadcrumb */}
        <Link href="/dashboard" className="btn-ghost mb-6 -ml-2 inline-flex">
          <ChevronLeft size={15} /> Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-slate-100 mb-1">
              {currentProject?.name || "Loading..."}
            </h1>
            {currentProject?.description && (
              <p className="text-slate-400 text-sm">{currentProject.description}</p>
            )}
            <p className="text-xs text-slate-600 mt-2">
              {studies.length} {studies.length === 1 ? "study" : "studies"} · {extractedCount} extracted
            </p>
          </div>
          {extractedCount > 0 && (
            <button onClick={handleExport} className="btn-primary">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {/* Upload zone */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Upload Studies</h2>
          <DropZone onUpload={handleUpload} disabled={uploading} />
        </div>

        {/* Studies list */}
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Studies ({studies.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-clinical-400" />
            </div>
          ) : studies.length === 0 ? (
            <div className="card p-10 text-center">
              <BookOpen size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Upload research PDFs to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {studies.map((study) => (
                <StudyRow
                  key={study.id}
                  study={study}
                  projectId={projectId}
                  onDelete={deleteStudy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
