import axios from "@/lib/axios";

const appointmentMasterService = {
  getAll: (params) => axios.get("/appointment-master", { params }),
  getById: (id) => axios.get(`/appointment-master/${id}`),
  create: (data) => axios.post("/appointment-master", data),
  update: (id, data) => axios.put(`/appointment-master/${id}`, data),
  delete: (id) => axios.delete(`/appointment-master/${id}`),
};

export default appointmentMasterService;
