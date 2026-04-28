"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderOpen, FileText, Loader2, Trash2, ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const p = await createProject(name.trim(), desc.trim() || undefined);
    setCreating(false);
    if (p) {
      setShowCreate(false);
      setName("");
      setDesc("");
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-3xl text-slate-100">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Projects", value: projects.length },
            { label: "Total Studies", value: projects.reduce((a, p) => a + (p.study_count || 0), 0) },
            { label: "Extracted", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className="text-2xl font-display text-clinical-400 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-200">Projects</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <Plus size={15} /> New project
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="card p-5 mb-4 space-y-3">
            <div>
              <label className="label">Project name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g. Diabetes RCT Meta-Analysis 2024"
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-field"
                placeholder="Brief description of the review"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating || !name.trim()} className="btn-primary">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Project list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-clinical-400" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderOpen size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="card px-5 py-4 flex items-center gap-4 hover:border-slate-700 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-clinical-600/10 border border-clinical-600/20 flex items-center justify-center shrink-0">
                  <FolderOpen size={16} className="text-clinical-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 text-sm">{project.name}</div>
                  {project.description && (
                    <div className="text-xs text-slate-500 truncate mt-0.5">{project.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <FileText size={12} />
                  {project.study_count} {project.study_count === 1 ? "study" : "studies"}
                </div>
                <div className="text-xs text-slate-600 shrink-0 hidden sm:block">{formatDate(project.created_at)}</div>
                <button
                  onClick={(e) => { e.preventDefault(); deleteProject(project.id); }}
                  className="btn-ghost opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={14} />
                </button>
                <Link href={`/projects/${project.id}`} className="btn-ghost p-1">
                  <ChevronRight size={16} className="text-slate-500" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
