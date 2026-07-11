import axios from "@/lib/axios";

const patientService = {
  getAll: () => axios.get("/patients"),
  getById: (id) => axios.get(`/patients/${id}`),
  create: (data) => axios.post("/patients", data),
  update: (id, data) => axios.put(`/patients/${id}`, data),
  delete: (id) => axios.delete(`/patients/${id}`),
};

export default patientService;
