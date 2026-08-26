import axios from "@/lib/axios";

const opdPhysicalExamService = {
  getAll: (params) => axios.get("/opd-physical-exams", { params }),
  getById: (id) => axios.get(`/opd-physical-exams/${id}`),
  create: (data) => axios.post("/opd-physical-exams", data),
  sync: (data) => axios.post("/opd-physical-exams/sync", data),
  update: (id, data) => axios.put(`/opd-physical-exams/${id}`, data),
  delete: (id) => axios.delete(`/opd-physical-exams/${id}`),
};

export default opdPhysicalExamService;
