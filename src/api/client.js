const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getToken() {
  return localStorage.getItem("nx_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Terjadi kesalahan (${res.status})`);
  }
  return data;
}

async function requestUpload(path, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(API_BASE + path, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Terjadi kesalahan (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body) => request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  upload: (path, file) => requestUpload(path, file),
};

// ---- Endpoint spesifik (biar komponen nggak nulis path mentah) ----
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  listFoundations: () => api.get("/auth/foundations"),
  verifyFoundation: (id) => api.put(`/auth/verify-foundation/${id}`),
};

export const campaignApi = {
  list: (status, page, limit) => {
    const q = new URLSearchParams();
    if (status && status !== "ALL") q.append("status", status);
    if (page) q.append("page", page);
    if (limit) q.append("limit", limit);
    const qs = q.toString();
    return api.get(qs ? `/campaigns?${qs}` : "/campaigns");
  },
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post("/campaigns", data),
  planDraft: (data) => api.post("/campaigns/plan-draft", data),
  planMilestones: (data) => api.post("/campaigns/plan-milestones", data),
  validateMilestoneStructure: (data) => api.post("/campaigns/validate-milestone-structure", data),
  resolveFrozen: (id, approve) => api.post(`/campaigns/${id}/resolutions`, { approve }),
  updateImage: (id, imageUrl) => api.patch(`/campaigns/${id}/image`, { imageUrl }),
  approveCampaign: (id) => api.put(`/campaigns/${id}/approve`),
  rejectCampaign: (id) => api.put(`/campaigns/${id}/reject`),
};

export const transactionApi = {
  list: () => api.get("/transactions"),
};

export const notificationApi = {
  list: () => api.get("/notifications"),
  markAsRead: (id = null) => api.post("/notifications/read", { id }),
};
