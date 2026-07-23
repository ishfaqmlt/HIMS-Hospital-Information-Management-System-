import axios from "@/lib/axios";

const billingDetailService = {
  getAll: (params) => axios.get("/billing-details", { params }),
  getById: (id) => axios.get(`/billing-details/${id}`),
  create: (data) => axios.post("/billing-details", data),
  update: (id, data) => axios.put(`/billing-details/${id}`, data),
  delete: (id) => axios.delete(`/billing-details/${id}`),
};

export default billingDetailService;
