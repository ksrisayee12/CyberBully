import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  profile: () => api.get("/auth/profile"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
};

export const monitorApi = {
  start: (data: any) => api.post("/monitor/start", data),
  stop: (data: any) => api.post("/monitor/stop", data),
  status: () => api.get("/monitor/status"),
};

export const alertApi = {
  list: () => api.get("/alerts"),
  acknowledge: (id: number) => api.post(`/alerts/${id}/acknowledge`),
};

export const analyticsApi = {
  overview: () => api.get("/analytics/overview"),
  trends: () => api.get("/analytics/trends"),
  offenders: () => api.get("/analytics/offenders"),
};

export const conversationApi = {
  list: () => api.get("/conversations"),
  detail: (id: number) => api.get(`/conversations/${id}`),
};

export default api;
