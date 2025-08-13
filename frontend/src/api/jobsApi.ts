import { api, apiPrivate } from "./apiBase";

export type JobType = "full_time" | "part_time" | "contract" | "internship";

export type EmployerSlim = {
  id: number;
  name: string;
};

export type JobPost = {
  id: number;
  title: string;
  description: string;
  location: string;
  job_type: JobType;
  employer?: EmployerSlim
  created_at?: string;
};

export type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const jobsApi = {
  //public listings
  listPublic: (params: {
    keyword?: string;
    location?: string;
    job_type?: JobType;
    sort?: string; // e.g. -created_at
    page?: number;
    per_page?: number;
  }) => api.get(`/jobs`, { params }),

  showPublic: (id: number) => api.get(`/jobs/${id}`),

  listMine: (page = 1, perPage = 10) =>
    apiPrivate.get(`/employer/jobs`, { params: { page, per_page: perPage } }),

  create: (data: {
    title: string;
    description: string;
    location: string;
    job_type: JobType;
  }) => apiPrivate.post(`/employer/jobs`, data),

  update: (
    id: number,
    data: Partial<{
      title: string;
      description: string;
      location: string;
      job_type: JobType;
    }>
  ) => apiPrivate.put(`/employer/jobs/${id}`, data),

  remove: (id: number) => apiPrivate.delete(`/employer/jobs/${id}`),

  listApplications: (jobId: number, page = 1, perPage = 10) =>
    apiPrivate.get(`/employer/jobs/${jobId}/applications`, {
      params: { page, per_page: perPage },
    }),
};

export default jobsApi;
