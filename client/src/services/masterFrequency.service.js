import axios from "@/lib/axios";

const masterFrequencyService = {
  getAll: (params) => axios.get("/master-frequencies", { params }),
  getById: (id) => axios.get(`/master-frequencies/${id}`),
  create: (data) => axios.post("/master-frequencies", data),
  update: (id, data) => axios.put(`/master-frequencies/${id}`, data),
  delete: (id) => axios.delete(`/master-frequencies/${id}`),
};

export default masterFrequencyService;
