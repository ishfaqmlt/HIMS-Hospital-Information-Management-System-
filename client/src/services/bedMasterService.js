import axios from "@/lib/axios";

const bedMasterService = {
  getAll: (params) => axios.get("/bed-master", { params }),
  getById: (id) => axios.get(`/bed-master/${id}`),
  create: (data) => axios.post("/bed-master", data),
  update: (id, data) => axios.put(`/bed-master/${id}`, data),
  delete: (id) => axios.delete(`/bed-master/${id}`),
};

export default bedMasterService;
