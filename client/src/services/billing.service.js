import axios from "@/lib/axios";

const billingService = {
  getAll: (params) => axios.get("/billings", { params }),
  getById: (id) => axios.get(`/billings/${id}`),
  create: (data) => axios.post("/billings", data),
  update: (id, data) => axios.put(`/billings/${id}`, data),
  delete: (id) => axios.delete(`/billings/${id}`),
};

export default billingService;
