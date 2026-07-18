import axios from "@/lib/axios";

const labTestService = {
  getAll: (params) => axios.get("/lab-tests", { params }),
  getById: (id) => axios.get(`/lab-tests/${id}`),
  create: (data) => axios.post("/lab-tests", data),
  update: (id, data) => axios.put(`/lab-tests/${id}`, data),
  delete: (id) => axios.delete(`/lab-tests/${id}`),
};

export default labTestService;
