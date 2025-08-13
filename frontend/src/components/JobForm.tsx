"use client";

import { useState } from "react";
import type { JobType, JobPost } from "@/api/jobsApi";

type Props = {
  initial?: Partial<JobPost>;
  onSubmit: (payload: {
    title: string;
    description: string;
    location: string;
    job_type: JobType;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const JOB_TYPES: JobType[] = [
  "full_time",
  "part_time",
  "contract",
  "internship",
];

export default function JobForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [jobType, setJobType] = useState<JobType>(
    (initial?.job_type as JobType) ?? "full_time"
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({ title, description, location, job_type: jobType });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm">Title</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm">Location</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Job Type</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobType)}
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          disabled={busy}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
