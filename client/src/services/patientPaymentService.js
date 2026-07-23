import axios from "@/lib/axios";

const patientPaymentService = {
  getAll: (params) => axios.get("/patient-payments", { params }),
  getById: (id) => axios.get(`/patient-payments/${id}`),
  create: (data) => axios.post("/patient-payments", data),
  update: (id, data) => axios.put(`/patient-payments/${id}`, data),
  delete: (id) => axios.delete(`/patient-payments/${id}`),
};

export default patientPaymentService;
