"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import jobsApi from "@/api/jobsApi";
import { apiPrivate } from "@/api/apiBase";

type AppItem = {
  id: number;
  candidate?: { id: number; name: string; email: string };
  cover_letter?: string | null;
  resume?: { original_name?: string | null; download_url?: string | null };
  created_at?: string;
};

export default function JobApplicationsPage() {
  const router = useRouter();
  const jobId = Number(router.query.id);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await jobsApi.listApplications(jobId);
      const payload = res.data?.data ?? res.data;
      const list = payload?.data ?? payload?.applications ?? payload; // handle shapes
      setApps(list as AppItem[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function downloadResume(a: AppItem) {
    try {
      const url = a.resume?.download_url;
      if (!url) return;
      const resp = await apiPrivate.get(url, { responseType: "blob" }); // keep Authorization header
      const blob = new Blob([resp.data], {
        type: resp.headers["content-type"] || "application/pdf",
      });
      const aTag = document.createElement("a");
      aTag.href = URL.createObjectURL(blob);
      aTag.download = a.resume?.original_name || "resume.pdf";
      document.body.appendChild(aTag);
      aTag.click();
      aTag.remove();
      URL.revokeObjectURL(aTag.href);
    } catch (e) {
      alert("Download failed. {" + e + "}");
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <a
          href="/employer/dashboard"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Back
        </a>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : apps.length === 0 ? (
        <div className="mt-6 rounded-md border p-6 text-center text-sm text-gray-600">
          No applications yet.
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border">
          {apps.map((a) => (
            <li key={a.id} className="p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm">
                    <span className="font-medium">{a.candidate?.name}</span>{" "}
                    <span className="text-gray-500">
                      &lt;{a.candidate?.email}&gt;
                    </span>
                  </div>
                  {a.cover_letter && (
                    <p className="mt-1 max-w-3xl text-sm text-gray-700">
                      {a.cover_letter}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    Applied{" "}
                    {a.created_at
                      ? new Date(a.created_at).toLocaleString()
                      : ""}
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => downloadResume(a)}
                    disabled={!a.resume?.download_url}
                    className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-100"
                  >
                    Download resume
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
