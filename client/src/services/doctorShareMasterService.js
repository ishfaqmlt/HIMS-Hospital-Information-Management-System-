import axios from "@/lib/axios";

const doctorShareMasterService = {
  getAll: (params) => axios.get("/doctor-share-master", { params }),
  getById: (id) => axios.get(`/doctor-share-master/${id}`),
  create: (data) => axios.post("/doctor-share-master", data),
  bulkCreate: (data) => axios.post("/doctor-share-master/bulk", data),
  update: (id, data) => axios.put(`/doctor-share-master/${id}`, data),
  delete: (id) => axios.delete(`/doctor-share-master/${id}`),
  bulkDelete: (ids) => axios.delete("/doctor-share-master/bulk", { data: { ids } }),
};

export default doctorShareMasterService;
