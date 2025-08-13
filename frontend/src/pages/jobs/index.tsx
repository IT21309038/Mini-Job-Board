/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import jobsApi, { JobPost, JobType } from "@/api/jobsApi";
import EmptyState from "@/components/EmptyState";

type FilterState = {
  keyword: string;
  location: string;
  job_type: "" | JobType;
  sort: string; // "-created_at" newest first
  page: number;
  per_page: number;
};

export default function JobsPage() {
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    location: "",
    job_type: "",
    sort: "-created_at",
    page: 1,
    per_page: 10,
  });
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await jobsApi.listPublic({
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        job_type: (filters.job_type || undefined) as JobType | undefined,
        sort: filters.sort || undefined,
        page: filters.page,
        per_page: filters.per_page,
      });
      const payload = res.data?.data ?? res.data;
      const list = payload?.data ?? payload?.jobs ?? payload;
      setJobs(list as JobPost[]);
      const m = payload?.meta ?? res.data?.meta ?? null;
      setMeta(m);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sort]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    void load();
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      {/* Filters */}
      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 rounded-xl border p-4 md:grid-cols-4"
      >
        <input
          placeholder="Search title/description"
          className="rounded-md border px-3 py-2 text-sm"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          placeholder="Location"
          className="rounded-md border px-3 py-2 text-sm"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={filters.job_type}
          onChange={(e) =>
            setFilters({ ...filters, job_type: e.target.value as any })
          }
        >
          <option value="">Any type</option>
          <option value="full_time">Full time</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <div className="flex items-center gap-2">
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
          </select>
          <button className="whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm text-white">
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid place-items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found."
          message="Try adjusting your filters and search again."
        />
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a
                    href={`/jobs/${j.id}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {j.title}
                  </a>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                    {j.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full border px-2 py-0.5">
                      {j.location}
                    </span>
                    <span className="rounded-full border px-2 py-0.5">
                      {j.job_type?.replace("_", " ")}
                    </span>
                    {"employer" in j && (j as any).employer?.name && (
                      <span className="rounded-full border px-2 py-0.5">
                        by {(j as any).employer.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <a
                    href={`/jobs/${j.id}`}
                    className="rounded-md border px-3 py-1.5 text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pager */}
      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={filters.page <= 1}
            onClick={() =>
              setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
            }
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={filters.page >= meta.last_page}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: Math.min(meta.last_page, f.page + 1),
              }))
            }
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}