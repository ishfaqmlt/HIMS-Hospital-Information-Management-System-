import axios from "@/lib/axios";

const patientTypeService = {
  getAll: () => axios.get("/patient-types"),
  getById: (id) => axios.get(`/patient-types/${id}`),
  create: (data) => axios.post("/patient-types", data),
  update: (id, data) => axios.put(`/patient-types/${id}`, data),
  delete: (id) => axios.delete(`/patient-types/${id}`),
};

export default patientTypeService;
