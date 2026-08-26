import axios from "@/lib/axios";

const opdDiagnosisService = {
  getAll: (params) => axios.get("/opd-diagnoses", { params }),
  getById: (id) => axios.get(`/opd-diagnoses/${id}`),
  create: (data) => axios.post("/opd-diagnoses", data),
  sync: (data) => axios.post("/opd-diagnoses/sync", data),
  update: (id, data) => axios.put(`/opd-diagnoses/${id}`, data),
  delete: (id) => axios.delete(`/opd-diagnoses/${id}`),
};

export default opdDiagnosisService;
