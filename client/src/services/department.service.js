import axios from "@/lib/axios";

const departmentService = {
  getAll: () => axios.get("/departments"),
  getById: (id) => axios.get(`/departments/${id}`),
  create: (data) => axios.post("/departments", data),
  update: (id, data) => axios.put(`/departments/${id}`, data),
  delete: (id) => axios.delete(`/departments/${id}`),
};

export default departmentService;
