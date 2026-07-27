import axios from "@/lib/axios";

const floorService = {
  getAll: (params) => axios.get("/floor-master", { params }),
  getById: (id) => axios.get(`/floor-master/${id}`),
  create: (data) => axios.post("/floor-master", data),
  update: (id, data) => axios.put(`/floor-master/${id}`, data),
  delete: (id) => axios.delete(`/floor-master/${id}`),
};

export default floorService;
