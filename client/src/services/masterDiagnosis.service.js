import axios from "@/lib/axios";

const masterDiagnosisService = {
  getAll: (params) => axios.get("/master-diagnosis", { params }),
  getById: (id) => axios.get(`/master-diagnosis/${id}`),
  create: (data) => axios.post("/master-diagnosis", data),
  update: (id, data) => axios.put(`/master-diagnosis/${id}`, data),
  delete: (id) => axios.delete(`/master-diagnosis/${id}`),
};

export default masterDiagnosisService;
