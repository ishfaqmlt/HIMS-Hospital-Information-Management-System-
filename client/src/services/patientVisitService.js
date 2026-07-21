import axios from "@/lib/axios";

const patientVisitService = {
  getAll: (params) => axios.get("/patient-visits", { params }),
  getById: (mrn) => axios.get(`/patient-visits/${mrn}`),
  getByMrn: (mrn) => axios.get(`/patient-visits/by-mrn/${mrn}`),
  getByPatientId: (patientId) => axios.get(`/patient-visits/by-patient/${patientId}`),
  create: (data) => axios.post("/patient-visits", data),
  update: (mrn, data) => axios.put(`/patient-visits/${mrn}`, data),
  delete: (mrn) => axios.delete(`/patient-visits/${mrn}`),
};

export default patientVisitService;
