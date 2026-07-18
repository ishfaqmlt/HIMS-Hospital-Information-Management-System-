import axios from "@/lib/axios";

const emergencyCaseService = {
  getAll: (params) => axios.get("/emergency-cases", { params }),
  getById: (id) => axios.get(`/emergency-cases/${id}`),
  create: (data) => axios.post("/emergency-cases", data),
  update: (id, data) => axios.put(`/emergency-cases/${id}`, data),
  delete: (id) => axios.delete(`/emergency-cases/${id}`),
};

export default emergencyCaseService;
