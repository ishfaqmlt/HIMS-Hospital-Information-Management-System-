import axios from "@/lib/axios";

const patientPaymentService = {
  getAll: (params) => axios.get("/patient-payments", { params }),
  getById: (id) => axios.get(`/patient-payments/${id}`),
  create: (data) => axios.post("/patient-payments", data),
  update: (id, data) => axios.put(`/patient-payments/${id}`, data),
  delete: (id) => axios.delete(`/patient-payments/${id}`),
  cancel: (id) => axios.post(`/patient-payments/${id}/cancel`),
  getAdvanceBalance: (mrn) => axios.get("/patient-payments/advance-balance", { params: { mrn } }),
  applyAdvance: (data) => axios.post("/patient-payments/apply-advance", data),
  refundAdvance: (data) => axios.post("/patient-payments/refund-advance", data),
};

export default patientPaymentService;
