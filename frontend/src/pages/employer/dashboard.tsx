/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import jobsApi, { JobPost } from "@/api/jobsApi";
import JobForm from "@/components/JobForm";
import { useAuth } from "@/context/AuthContext";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<JobPost | null>(null);
  const perPage = 10;

  const title = useMemo(
    () => `Employer Dashboard${user ? ` — ${user.name}` : ""}`,
    [user]
  );

  async function load() {
    setLoading(true);
    try {
      const res = await jobsApi.listMine(page, perPage);
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
  }, [page]);

  async function handleCreate(values: any) {
    await jobsApi.create(values);
    setShowCreate(false);
    setPage(1);
    await load();
  }

  async function handleUpdate(values: any) {
    if (!editing) return;
    await jobsApi.update(editing.id, values);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this job?")) return;
    await jobsApi.remove(id);
    await load();
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your job postings and applicants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-black px-3 py-2 text-sm text-white"
          >
            New Job
          </button>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <div className="mt-6 rounded-xl border p-4">
          <h2 className="text-lg font-medium">Create Job</h2>
          <div className="mt-4">
            <JobForm
              submitLabel="Create"
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      {/* Edit */}
      {editing && (
        <div className="mt-6 rounded-xl border p-4">
          <h2 className="text-lg font-medium">Edit Job</h2>
          <div className="mt-4">
            <JobForm
              initial={editing}
              submitLabel="Update"
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-8">
        <h2 className="text-lg font-medium">My Jobs</h2>

        {loading ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-4 rounded-md border p-6 text-center text-sm text-gray-600">
            You haven’t posted any jobs yet.
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {jobs.map((j) => (
              <li key={j.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{j.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                      {j.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="rounded-full border px-2 py-0.5">
                        {j.location}
                      </span>
                      <span className="rounded-full border px-2 py-0.5">
                        {j.job_type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 space-x-2">
                    <a
                      href={`/employer/jobs/${j.id}/applications`}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      Applications
                    </a>
                    <button
                      onClick={() => setEditing(j)}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Delete
                    </button>
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
    </div>
  );
}
