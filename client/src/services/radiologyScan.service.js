import axios from "@/lib/axios";

const radiologyScanService = {
  getAll: (params) => axios.get("/radiology-scans", { params }),
  getById: (id) => axios.get(`/radiology-scans/${id}`),
  create: (data) => axios.post("/radiology-scans", data),
  update: (id, data) => axios.put(`/radiology-scans/${id}`, data),
  delete: (id) => axios.delete(`/radiology-scans/${id}`),
};

export default radiologyScanService;
