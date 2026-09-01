import axios from "@/lib/axios";

const masterInstructionService = {
  getAll: (params) => axios.get("/master-instructions", { params }),
  getById: (id) => axios.get(`/master-instructions/${id}`),
  create: (data) => axios.post("/master-instructions", data),
  update: (id, data) => axios.put(`/master-instructions/${id}`, data),
  delete: (id) => axios.delete(`/master-instructions/${id}`),
};

export default masterInstructionService;
