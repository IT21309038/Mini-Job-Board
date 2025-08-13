import { api, apiPrivate } from "@/api/apiBase";

const authAPIs = {
  login: (data: { email: string, password: string }) =>
    api.post("auth/login", data),

  register: (data: {
    name: string,
    email: string,
    password: string,
    role: "employer" | "candidate",
  }) => api.post("auth/register", data),

  logout: () => apiPrivate.post("auth/logout"),

  getCurrentUser: () => apiPrivate.get("auth/me"),
};

export default authAPIs;
