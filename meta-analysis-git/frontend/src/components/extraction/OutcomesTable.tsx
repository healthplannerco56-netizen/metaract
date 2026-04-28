"use client";
import { Plus, Trash2 } from "lucide-react";
import type { Outcome } from "@/types";

interface Props {
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
}

const emptyOutcome = (): Outcome => ({
  name: "",
  effect_measure: "",
  effect_value: "",
  confidence_interval: "",
  p_value: "",
});

export default function OutcomesTable({ outcomes, onChange }: Props) {
  const update = (index: number, field: keyof Outcome, value: string) => {
    const updated = outcomes.map((o, i) => (i === index ? { ...o, [field]: value } : o));
    onChange(updated);
  };

  const add = () => onChange([...outcomes, emptyOutcome()]);

  const remove = (index: number) => onChange(outcomes.filter((_, i) => i !== index));

  const cols: { key: keyof Outcome; label: string; width: string }[] = [
    { key: "name", label: "Outcome", width: "w-40" },
    { key: "effect_measure", label: "Measure", width: "w-28" },
    { key: "effect_value", label: "Value", width: "w-24" },
    { key: "confidence_interval", label: "95% CI", width: "w-32" },
    { key: "p_value", label: "P-value", width: "w-24" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="label mb-0">Outcomes</label>
        <button onClick={add} className="btn-ghost text-xs gap-1.5 py-1">
          <Plus size={12} /> Add outcome
        </button>
      </div>

      {outcomes.length === 0 ? (
        <div className="text-center py-6 rounded-lg bg-slate-800/40 border border-slate-800 text-sm text-slate-500">
          No outcomes extracted. Add one manually.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {cols.map((col) => (
                  <th key={col.key} className="text-left py-2 px-2 text-slate-500 font-medium uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome, i) => (
                <tr key={i} className="border-b border-slate-800/50 group">
                  {cols.map((col) => (
                    <td key={col.key} className="py-1.5 px-1">
                      <input
                        value={outcome[col.key] ?? ""}
                        onChange={(e) => update(i, col.key, e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-800/60 border border-transparent hover:border-slate-700 focus:border-clinical-500 text-slate-200 text-xs transition-colors outline-none font-mono"
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="py-1.5 px-1">
                    <button
                      onClick={() => remove(i)}
                      className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
