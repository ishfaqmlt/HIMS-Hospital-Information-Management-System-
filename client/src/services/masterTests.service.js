import api from "./axios";

const masterTestService = {
  getAll: (params) => api.get("/lab-master-tests", { params }),
  getById: (id) => api.get(`/lab-master-tests/${id}`),
  create: (data) => api.post("/lab-master-tests", data),
  update: (id, data) => api.put(`/lab-master-tests/${id}`, data),
};

export default masterTestService;
