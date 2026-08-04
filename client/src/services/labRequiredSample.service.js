import api from "./axios";

const labRequiredSampleService = {
  getAll: () => api.get("/lab-required-samples"),
  getById: (id) => api.get(`/lab-required-samples/${id}`),
  create: (data) => api.post("/lab-required-samples", data),
  update: (id, data) => api.put(`/lab-required-samples/${id}`, data),
};

export default labRequiredSampleService;
