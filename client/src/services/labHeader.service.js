import api from "./axios";

const labHeaderService = {
  getAll: () => api.get("/lab-headers"),
  getById: (id) => api.get(`/lab-headers/${id}`),
  create: (data) => api.post("/lab-headers", data),
  update: (id, data) => api.put(`/lab-headers/${id}`, data),
  delete: (id) => api.delete(`/lab-headers/${id}`),
};

export default labHeaderService;
