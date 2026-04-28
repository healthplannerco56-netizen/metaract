import { create } from "zustand";
import { projectsApi, studiesApi } from "@/lib/api";
import type { Project, Study } from "@/types";
import toast from "react-hot-toast";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  studies: Study[];
  loading: boolean;
  uploading: boolean;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;

  fetchStudies: (projectId: string) => Promise<void>;
  uploadStudy: (projectId: string, file: File) => Promise<Study | null>;
  deleteStudy: (studyId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  studies: [],
  loading: false,
  uploading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const res = await projectsApi.list();
      set({ projects: res.data, loading: false });
    } catch {
      set({ loading: false });
      toast.error("Failed to load projects");
    }
  },

  fetchProject: async (id) => {
    try {
      const res = await projectsApi.get(id);
      set({ currentProject: res.data });
    } catch {
      toast.error("Project not found");
    }
  },

  createProject: async (name, description) => {
    try {
      const res = await projectsApi.create(name, description);
      const project = res.data as Project;
      set((s) => ({ projects: [project, ...s.projects] }));
      toast.success("Project created");
      return project;
    } catch {
      toast.error("Failed to create project");
      return null;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectsApi.delete(id);
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  },

  fetchStudies: async (projectId) => {
    set({ loading: true });
    try {
      const res = await studiesApi.list(projectId);
      set({ studies: res.data, loading: false });
    } catch {
      set({ loading: false });
      toast.error("Failed to load studies");
    }
  },

  uploadStudy: async (projectId, file) => {
    set({ uploading: true });
    try {
      const res = await studiesApi.upload(projectId, file);
      const study = res.data as Study;
      set((s) => ({ studies: [study, ...s.studies], uploading: false }));
      toast.success(`${file.name} uploaded successfully`);
      return study;
    } catch (err: any) {
      set({ uploading: false });
      toast.error(err?.response?.data?.detail || "Upload failed");
      return null;
    }
  },

  deleteStudy: async (studyId) => {
    try {
      await studiesApi.delete(studyId);
      set((s) => ({ studies: s.studies.filter((st) => st.id !== studyId) }));
      toast.success("Study deleted");
    } catch {
      toast.error("Failed to delete study");
    }
  },
}));
