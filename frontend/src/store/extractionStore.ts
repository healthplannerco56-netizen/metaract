import { create } from "zustand";
import { extractionApi } from "@/lib/api";
import type { Extraction, ExtractionData } from "@/types";
import toast from "react-hot-toast";

interface ExtractionState {
  extraction: Extraction | null;
  extracting: boolean;
  saving: boolean;
  error: string | null;

  fetchExtraction: (studyId: string) => Promise<void>;
  runExtraction: (studyId: string) => Promise<void>;
  updateExtraction: (studyId: string, data: ExtractionData) => Promise<void>;
  setExtraction: (e: Extraction) => void;
  clearExtraction: () => void;
}

export const useExtractionStore = create<ExtractionState>((set) => ({
  extraction: null,
  extracting: false,
  saving: false,
  error: null,

  fetchExtraction: async (studyId) => {
    try {
      const res = await extractionApi.get(studyId);
      set({ extraction: res.data, error: null });
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        set({ error: "Failed to load extraction" });
      }
    }
  },

  runExtraction: async (studyId) => {
    set({ extracting: true, error: null });
    try {
      toast.loading("Running AI extraction...", { id: "extract" });
      const res = await extractionApi.run(studyId);
      set({ extraction: res.data, extracting: false });
      toast.success("Extraction complete!", { id: "extract" });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Extraction failed";
      set({ extracting: false, error: msg });
      toast.error(msg, { id: "extract" });
    }
  },

  updateExtraction: async (studyId, data) => {
    set({ saving: true });
    try {
      const res = await extractionApi.update(studyId, data);
      set({ extraction: res.data, saving: false });
      toast.success("Changes saved");
    } catch {
      set({ saving: false });
      toast.error("Failed to save changes");
    }
  },

  setExtraction: (e) => set({ extraction: e }),
  clearExtraction: () => set({ extraction: null, error: null }),
}));
