import axios from "@/lib/axios";

const opdMedicationService = {
  getAll: (params) => axios.get("/opd-medications", { params }),
  getById: (id) => axios.get(`/opd-medications/${id}`),
  create: (data) => axios.post("/opd-medications", data),
  sync: (data) => axios.post("/opd-medications/sync", data),
  update: (id, data) => axios.put(`/opd-medications/${id}`, data),
  delete: (id) => axios.delete(`/opd-medications/${id}`),
};

export default opdMedicationService;
