import axios from "@/lib/axios";

const opdPrescriptionService = {
  getAll: (params) => axios.get("/opd-prescriptions", { params }),
  getById: (id) => axios.get(`/opd-prescriptions/${id}`),
  create: (data) => axios.post("/opd-prescriptions", data),
  update: (id, data) => axios.put(`/opd-prescriptions/${id}`, data),
  delete: (id) => axios.delete(`/opd-prescriptions/${id}`),
};

export default opdPrescriptionService;
