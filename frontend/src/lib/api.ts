import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post("/auth/register", { email, password }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  list: () => api.get("/projects"),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (name: string, description?: string) =>
    api.post("/projects", { name, description }),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ─── Studies ──────────────────────────────────────────────────────────────────
export const studiesApi = {
  list: (projectId: string) => api.get(`/studies/${projectId}`),
  get: (studyId: string) => api.get(`/study/${studyId}`),
  upload: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/upload/${projectId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (studyId: string) => api.delete(`/study/${studyId}`),
};

// ─── Extraction ───────────────────────────────────────────────────────────────
export const extractionApi = {
  run: (studyId: string) => api.post(`/extraction/extract/${studyId}`),
  get: (studyId: string) => api.get(`/extraction/${studyId}`),
  update: (studyId: string, jsonData: object) =>
    api.put(`/extraction/${studyId}`, { json_data: jsonData }),
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportApi = {
  csv: (projectId: string) =>
    api.get(`/export/${projectId}`, { responseType: "blob" }),
};

export default api;
