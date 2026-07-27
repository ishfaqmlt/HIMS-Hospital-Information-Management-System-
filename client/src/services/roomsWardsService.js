import axios from "@/lib/axios";

const roomsWardsService = {
  getAll: (params) => axios.get("/rooms-wards-master", { params }),
  getById: (id) => axios.get(`/rooms-wards-master/${id}`),
  create: (data) => axios.post("/rooms-wards-master", data),
  update: (id, data) => axios.put(`/rooms-wards-master/${id}`, data),
  delete: (id) => axios.delete(`/rooms-wards-master/${id}`),
};

export default roomsWardsService;
