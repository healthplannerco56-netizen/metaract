"use client";
import { useEffect } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight, FileText, Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useProjectStore } from "@/store/projectStore";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const { projects, loading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-slate-100">Projects</h1>
          <Link href="/dashboard" className="btn-primary">
            <Plus size={14} /> New project
          </Link>
        </div>

        {projects.length === 0 && !loading ? (
          <div className="card p-16 text-center">
            <FolderOpen size={42} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No projects yet.</p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="card px-5 py-4 flex items-center gap-4 hover:border-slate-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-clinical-600/10 border border-clinical-600/20 flex items-center justify-center">
                  <FolderOpen size={17} className="text-clinical-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200">{p.name}</div>
                  {p.description && <div className="text-xs text-slate-500 truncate mt-0.5">{p.description}</div>}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <FileText size={12} /> {p.study_count}
                </div>
                <div className="text-xs text-slate-600 hidden sm:block">{formatDate(p.created_at)}</div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
