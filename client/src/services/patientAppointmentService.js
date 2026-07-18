import axios from "@/lib/axios";

const patientAppointmentService = {
  getAll: (params) => axios.get("/patient-appointments", { params }),
  getSlots: (params) => axios.get("/patient-appointments/slots", { params }),
  getById: (id) => axios.get(`/patient-appointments/${id}`),
  create: (data) => axios.post("/patient-appointments", data),
  update: (id, data) => axios.put(`/patient-appointments/${id}`, data),
  delete: (id) => axios.delete(`/patient-appointments/${id}`),
};

export default patientAppointmentService;
