import axios from "@/lib/axios";

const serviceChargeService = {
  getAll: () => axios.get("/service-charges"),
  getById: (id) => axios.get(`/service-charges/${id}`),
  create: (data) => axios.post("/service-charges", data),
  update: (id, data) => axios.put(`/service-charges/${id}`, data),
  delete: (id) => axios.delete(`/service-charges/${id}`),
};

export default serviceChargeService;
