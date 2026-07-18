import axios from "@/lib/axios";

const pharmacyItemService = {
  getAll: (params) => axios.get("/pharmacy-items", { params }),
  getById: (id) => axios.get(`/pharmacy-items/${id}`),
  create: (data) => axios.post("/pharmacy-items", data),
  update: (id, data) => axios.put(`/pharmacy-items/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-items/${id}`),
};

export default pharmacyItemService;
