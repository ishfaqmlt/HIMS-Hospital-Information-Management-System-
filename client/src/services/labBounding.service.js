import api from "./axios";

const labBoundingService = {
  getAll: (params) => api.get("/lab-boundings", { params }),
  getById: (id) => api.get(`/lab-boundings/${id}`),
  create: (data) => api.post("/lab-boundings", data),
  update: (id, data) => api.put(`/lab-boundings/${id}`, data),
  delete: (id) => api.delete(`/lab-boundings/${id}`),
};

export default labBoundingService;
