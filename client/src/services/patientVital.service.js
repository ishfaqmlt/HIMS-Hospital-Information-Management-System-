import axios from "@/lib/axios";

const patientVitalService = {
  getAll: (params) => axios.get("/patient-vitals", { params }),
  getById: (id) => axios.get(`/patient-vitals/${id}`),
  create: (data) => axios.post("/patient-vitals", data),
  update: (id, data) => axios.put(`/patient-vitals/${id}`, data),
  delete: (id) => axios.delete(`/patient-vitals/${id}`),
};

export default patientVitalService;
