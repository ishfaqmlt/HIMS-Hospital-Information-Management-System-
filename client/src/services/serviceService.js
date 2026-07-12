import axios from "@/lib/axios";

const serviceService = {
  getAll: () => axios.get("/services"),
  getById: (id) => axios.get(`/services/${id}`),
  create: (data) => axios.post("/services", data),
  update: (id, data) => axios.put(`/services/${id}`, data),
  delete: (id) => axios.delete(`/services/${id}`),
};

export default serviceService;
