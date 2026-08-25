import axios from "@/lib/axios";

const masterSymptomService = {
  getAll: (params) => axios.get("/master-symptoms", { params }),
  getById: (id) => axios.get(`/master-symptoms/${id}`),
  create: (data) => axios.post("/master-symptoms", data),
  update: (id, data) => axios.put(`/master-symptoms/${id}`, data),
  delete: (id) => axios.delete(`/master-symptoms/${id}`),
};

export default masterSymptomService;
