import axios from "@/lib/axios";

const patientVisitService = {
  getAll: (params) => axios.get("/patient-visits", { params }),
  getById: (id) => axios.get(`/patient-visits/${id}`),
  getByVisitNo: (visitNo) => axios.get(`/patient-visits/by-visit-no/${visitNo}`),
  getByPatientId: (patientId) => axios.get(`/patient-visits/by-patient/${patientId}`),
  create: (data) => axios.post("/patient-visits", data),
  update: (id, data) => axios.put(`/patient-visits/${id}`, data),
  delete: (id) => axios.delete(`/patient-visits/${id}`),
};

export default patientVisitService;
