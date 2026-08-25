import axios from "@/lib/axios";

const masterAllergyService = {
  getAll: (params) => axios.get("/master-allergies", { params }),
  getById: (id) => axios.get(`/master-allergies/${id}`),
  create: (data) => axios.post("/master-allergies", data),
  update: (id, data) => axios.put(`/master-allergies/${id}`, data),
  delete: (id) => axios.delete(`/master-allergies/${id}`),
};

export default masterAllergyService;
