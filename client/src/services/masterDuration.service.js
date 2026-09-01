import axios from "@/lib/axios";

const masterDurationService = {
  getAll: (params) => axios.get("/master-durations", { params }),
  getById: (id) => axios.get(`/master-durations/${id}`),
  create: (data) => axios.post("/master-durations", data),
  update: (id, data) => axios.put(`/master-durations/${id}`, data),
  delete: (id) => axios.delete(`/master-durations/${id}`),
};

export default masterDurationService;
