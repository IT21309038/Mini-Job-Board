import { apiPrivate } from "./apiBase";

const applicationsApi = {

  // Candidate applies with PDF
  apply: (payload: {
    job_id: number;
    cover_letter?: string;
    resume?: File;
  }) => {
    const formdata = new FormData();
    formdata.append("job_id", String(payload.job_id));
    if (payload.cover_letter) formdata.append("cover_letter", payload.cover_letter);
    if (payload.resume) formdata.append("resume", payload.resume);
    return apiPrivate.post(`/candidate/applications`, formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Candidate lists their applications
  listMine: (page = 1, per_page = 10) =>
    apiPrivate.get(`/candidate/applications`, { params: { page, per_page } }),
};

export default applicationsApi;
