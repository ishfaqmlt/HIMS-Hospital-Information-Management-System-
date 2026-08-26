import axios from "@/lib/axios";

const opdHistoryService = {
  getAll: (params) => axios.get("/opd-histories", { params }),
  getById: (id) => axios.get(`/opd-histories/${id}`),
  create: (data) => axios.post("/opd-histories", data),
  update: (id, data) => axios.put(`/opd-histories/${id}`, data),
  delete: (id) => axios.delete(`/opd-histories/${id}`),
};

export default opdHistoryService;
