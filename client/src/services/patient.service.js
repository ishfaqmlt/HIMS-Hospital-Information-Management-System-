import axios from "@/lib/axios";

const patientService = {
  getAll: (params) => axios.get("/patients", { params }),
  getById: (id) => axios.get(`/patients/${id}`),
  create: (data) => axios.post("/patients", data),
  update: (id, data) => axios.put(`/patients/${id}`, data),
  delete: (id) => axios.delete(`/patients/${id}`),
};

export default patientService;
