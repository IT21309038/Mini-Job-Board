import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import jobsApi, { JobPost } from "@/api/jobsApi";
import applicationsApi from "@/api/applicationsApi";
import ResumeDropzone from "@/components/ResumeDropzone";

export default function JobDetailPage() {
  const { query, isReady } = useRouter();

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // apply form
  const [cover, setCover] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (jobId: number) => {
    setLoading(true);
    setNotFound(false);
    setFetchErr(null);
    try {
      const res = await jobsApi.showPublic(jobId);
      const payload = res.data?.data ?? res.data;
      const item = payload?.data ?? payload?.job ?? payload;
      setJob(item as JobPost);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setNotFound(true);
      } else {
        setFetchErr(
          e?.response?.data?.message ?? "Failed to load job details."
        );
      }
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const raw = query.id;
    const jobId = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
    if (!Number.isFinite(jobId)) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    void load(jobId);
  }, [isReady, query.id, load]);

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    if (!job?.id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await applicationsApi.apply({
        job_id: job.id,
        cover_letter: cover,
        resume: file,
      });
      setMsg("Application submitted.");
      setCover("");
      setFile(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to apply.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <a href="/jobs" className="text-sm text-blue-600 hover:underline">
        ← Back to jobs
      </a>

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : notFound ? (
        <div className="mt-6 rounded-md border p-6 text-center">
          <h2 className="text-base font-medium">Job not found</h2>
          <p className="mt-1 text-sm text-gray-600">
            It may have been removed.
          </p>
        </div>
      ) : fetchErr ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchErr}
        </div>
      ) : job ? (
        <>
          <div className="mt-8 rounded-xl border p-4">
            <h2 className="text-lg font-medium">Apply for this job</h2>
            <form onSubmit={onApply} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm">Cover letter (optional)</label>
                <textarea
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  rows={4}
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                />
              </div>

              <ResumeDropzone
                value={file}
                onChange={setFile}
                accept="application/pdf"
                maxSizeMB={5}
              />

              {err && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}
              {msg && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {msg}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  disabled={busy || !file}
                  className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
