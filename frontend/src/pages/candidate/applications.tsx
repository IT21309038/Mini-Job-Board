import { useEffect, useState } from "react";
import applicationsApi from "@/api/applicationsApi";
import { apiPrivate } from "@/api/apiBase";

type ApplicationRow = {
  id: number;
  job?: { id: number; title: string; location: string; job_type: string };
  cover_letter?: string | null;
  resume?: { original_name?: string | null; download_url?: string | null };
  created_at?: string;
};

export default function CandidateApplicationsPage() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const res = await applicationsApi.listMine(page, 10);
      const payload = res.data?.data ?? res.data;
      // handle either { applications: [...], meta } or { data: [...], meta }
      const list =
        payload?.applications?.data ??
        payload?.applications ??
        payload?.data ??
        payload;

      setRows(list as ApplicationRow[]);
      const m = payload?.meta ?? res.data?.meta ?? null;
      setMeta(m);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function downloadResume(r: ApplicationRow) {
    try {
      const url = r.resume?.download_url;
      if (!url) return;
      const resp = await apiPrivate.get(url, { responseType: "blob" });
      const blob = new Blob([resp.data], {
        type: resp.headers["content-type"] || "application/pdf",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = r.resume?.original_name || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Download failed.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My applications</h1>
        <a href="/jobs" className="rounded-md border px-3 py-2 text-sm">
          Browse jobs
        </a>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-md border p-6 text-center text-sm text-gray-600">
          You haven’t applied to any jobs yet.
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border">
          {rows.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm">
                    <span className="font-medium">{r.job?.title}</span>{" "}
                    <span className="text-gray-500">
                      ({r.job?.location} • {r.job?.job_type?.replace("_", " ")})
                    </span>
                  </div>
                  {r.cover_letter && (
                    <p className="mt-1 max-w-3xl text-sm text-gray-700">
                      {r.cover_letter}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    Applied{" "}
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : ""}
                  </div>
                </div>
                <div className="shrink-0 space-x-2">
                  <button
                    disabled={!r.resume?.download_url}
                    onClick={() => downloadResume(r)}
                    className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Download resume
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
