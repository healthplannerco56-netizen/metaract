"use client";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import type { ExtractionData } from "@/types";
import OutcomesTable from "./OutcomesTable";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  data: ExtractionData;
  confidenceScore: number;
  validationIssues: string[];
  saving: boolean;
  onSave: (data: ExtractionData) => void;
}

export default function ExtractionForm({ data, confidenceScore, validationIssues, saving, onSave }: Props) {
  const [form, setForm] = useState<ExtractionData>(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const set = (path: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] || {}) };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const Field = ({
    label,
    path,
    type = "text",
    placeholder,
  }: {
    label: string;
    path: string;
    type?: string;
    placeholder?: string;
  }) => {
    const value = path.split(".").reduce((obj: any, key) => obj?.[key] ?? "", form);
    return (
      <div>
        <label className="label">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => set(path, type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
          className="input-field font-mono text-xs"
          placeholder={placeholder ?? "Not extracted"}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">

        {/* Identity */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            Study Identity
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Study ID" path="study_id" placeholder="e.g. Smith 2023" />
            <Field label="Study Design" path="study_design" placeholder="e.g. RCT, cohort" />
          </div>
        </section>

        {/* Population */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            Population
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Condition" path="population.condition" placeholder="e.g. Type 2 Diabetes" />
            <Field label="Mean Age" path="population.age_mean" type="number" placeholder="e.g. 62.4" />
          </div>
        </section>

        {/* Sample Size */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            Sample Size
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Intervention (n)" path="sample_size.intervention" type="number" />
            <Field label="Control (n)" path="sample_size.control" type="number" />
            <Field label="Total (n)" path="sample_size.total" type="number" />
          </div>
        </section>

        {/* Intervention */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            Intervention & Comparator
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Intervention" path="intervention" placeholder="e.g. Metformin 500mg BD" />
            <Field label="Comparator" path="comparator" placeholder="e.g. Placebo" />
          </div>
        </section>

        {/* Outcomes */}
        <section>
          <OutcomesTable
            outcomes={form.outcomes || []}
            onChange={(outcomes) => setForm((p) => ({ ...p, outcomes }))}
          />
        </section>
      </div>

      {/* Bottom: confidence + save */}
      <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
        {/* Confidence */}
        <div className="flex items-center gap-3">
          <ConfidenceBadge score={confidenceScore} />
          <span className="text-xs text-slate-500">AI validation score</span>
        </div>

        {/* Issues */}
        {validationIssues && validationIssues.length > 0 && (
          <div className="rounded-lg bg-yellow-400/5 border border-yellow-400/20 p-3 space-y-1">
            <p className="text-xs font-medium text-yellow-400 mb-1">Validation issues</p>
            {validationIssues.map((issue, i) => (
              <p key={i} className="text-xs text-yellow-300/80">• {issue}</p>
            ))}
          </div>
        )}

        <button onClick={() => onSave(form)} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
