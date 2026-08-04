import api from "./axios";

const subHeaderService = {
  getAll: () => api.get("/lab-sub-headers"),
  getById: (id) => api.get(`/lab-sub-headers/${id}`),
  create: (data) => api.post("/lab-sub-headers", data),
  update: (id, data) => api.put(`/lab-sub-headers/${id}`, data),
};

export default subHeaderService;
