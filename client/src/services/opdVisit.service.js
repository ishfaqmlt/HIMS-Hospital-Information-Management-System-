import axios from "@/lib/axios";

const opdVisitService = {
  getAll: (params) => axios.get("/opd-visits", { params }),
  getQueue: (params) => axios.get("/opd-visits/queue", { params }),
  getById: (id) => axios.get(`/opd-visits/${id}`),
  create: (data) => axios.post("/opd-visits", data),
  update: (id, data) => axios.put(`/opd-visits/${id}`, data),
  delete: (id) => axios.delete(`/opd-visits/${id}`),
};

export default opdVisitService;
