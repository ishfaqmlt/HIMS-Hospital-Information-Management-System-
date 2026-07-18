import axios from "@/lib/axios";

const ipdAdmissionService = {
  getAll: (params) => axios.get("/ipd-admissions", { params }),
  getById: (id) => axios.get(`/ipd-admissions/${id}`),
  create: (data) => axios.post("/ipd-admissions", data),
  update: (id, data) => axios.put(`/ipd-admissions/${id}`, data),
  delete: (id) => axios.delete(`/ipd-admissions/${id}`),
};

export default ipdAdmissionService;
