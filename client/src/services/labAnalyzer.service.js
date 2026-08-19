import axios from "@/lib/axios";

const labAnalyzerService = {
  getAll: (params) => axios.get("/lab-analyzers", { params }),
  getById: (id) => axios.get(`/lab-analyzers/${id}`),
  create: (data) => axios.post("/lab-analyzers", data),
  update: (id, data) => axios.put(`/lab-analyzers/${id}`, data),
  delete: (id) => axios.delete(`/lab-analyzers/${id}`),
};

export default labAnalyzerService;
