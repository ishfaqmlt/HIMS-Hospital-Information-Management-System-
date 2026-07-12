import axios from "@/lib/axios";

const doctorService = {
  getAll: () => axios.get("/doctors"),
  getById: (id) => axios.get(`/doctors/${id}`),
  create: (data) => axios.post("/doctors", data),
  update: (id, data) => axios.put(`/doctors/${id}`, data),
  delete: (id) => axios.delete(`/doctors/${id}`),
};

export default doctorService;
