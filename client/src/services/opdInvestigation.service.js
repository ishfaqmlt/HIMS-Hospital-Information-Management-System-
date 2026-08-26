import axios from "@/lib/axios";

const opdInvestigationService = {
  getAll: (params) => axios.get("/opd-investigations", { params }),
  getById: (id) => axios.get(`/opd-investigations/${id}`),
  create: (data) => axios.post("/opd-investigations", data),
  sync: (data) => axios.post("/opd-investigations/sync", data),
  update: (id, data) => axios.put(`/opd-investigations/${id}`, data),
  delete: (id) => axios.delete(`/opd-investigations/${id}`),
};

export default opdInvestigationService;
