import axios from "@/lib/axios";

const masterPhysicalExamService = {
  getAll: (params) => axios.get("/master-physical-exam", { params }),
  getById: (id) => axios.get(`/master-physical-exam/${id}`),
  create: (data) => axios.post("/master-physical-exam", data),
  update: (id, data) => axios.put(`/master-physical-exam/${id}`, data),
  delete: (id) => axios.delete(`/master-physical-exam/${id}`),
};

export default masterPhysicalExamService;
