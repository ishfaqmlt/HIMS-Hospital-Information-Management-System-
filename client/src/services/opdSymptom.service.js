import axios from "@/lib/axios";

const opdSymptomService = {
  getAll: (params) => axios.get("/opd-symptoms", { params }),
  getById: (id) => axios.get(`/opd-symptoms/${id}`),
  create: (data) => axios.post("/opd-symptoms", data),
  sync: (data) => axios.post("/opd-symptoms/sync", data),
  update: (id, data) => axios.put(`/opd-symptoms/${id}`, data),
  delete: (id) => axios.delete(`/opd-symptoms/${id}`),
};

export default opdSymptomService;
