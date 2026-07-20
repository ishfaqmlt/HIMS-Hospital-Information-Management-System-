import axios from "@/lib/axios";

const insurancePlanService = {
  getAll: (params) => axios.get("/insurance-plans", { params }),
  getById: (id) => axios.get(`/insurance-plans/${id}`),
  create: (data) => axios.post("/insurance-plans", data),
  update: (id, data) => axios.put(`/insurance-plans/${id}`, data),
  delete: (id) => axios.delete(`/insurance-plans/${id}`),
};

export default insurancePlanService;
