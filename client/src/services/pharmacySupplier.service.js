import axios from "@/lib/axios";

const pharmacySupplierService = {
  getAll: (params) => axios.get("/pharmacy-suppliers", { params }),
  getById: (id) => axios.get(`/pharmacy-suppliers/${id}`),
  create: (data) => axios.post("/pharmacy-suppliers", data),
  update: (id, data) => axios.put(`/pharmacy-suppliers/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-suppliers/${id}`),
};

export default pharmacySupplierService;
