import axios from "@/lib/axios";

const insuranceCompanyService = {
  getAll: (params) => axios.get("/insurance-companies", { params }),
  getById: (id) => axios.get(`/insurance-companies/${id}`),
  create: (data) => axios.post("/insurance-companies", data),
  update: (id, data) => axios.put(`/insurance-companies/${id}`, data),
  delete: (id) => axios.delete(`/insurance-companies/${id}`),
};

export default insuranceCompanyService;
