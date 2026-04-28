export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  study_count: number;
}

export interface Study {
  id: string;
  project_id: string;
  file_name: string;
  page_count?: number;
  status: "uploaded" | "processing" | "extracted" | "error";
  created_at: string;
}

export interface SampleSize {
  intervention: number | null;
  control: number | null;
  total: number | null;
}

export interface Population {
  condition: string;
  age_mean: number | null;
}

export interface Outcome {
  name: string;
  effect_measure: string;
  effect_value: string;
  confidence_interval: string;
  p_value: string;
}

export interface ExtractionData {
  study_id: string;
  study_design: string;
  sample_size: SampleSize;
  population: Population;
  intervention: string;
  comparator: string;
  outcomes: Outcome[];
}

export interface Extraction {
  id: string;
  study_id: string;
  json_data: ExtractionData;
  confidence_score: number;
  validation_issues: string[];
  created_at: string;
}

export interface ApiError {
  detail: string;
}
