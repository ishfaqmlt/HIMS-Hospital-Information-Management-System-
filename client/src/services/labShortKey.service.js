import axios from "@/lib/axios";

const labShortKeyService = {
  getAll: (params) => axios.get("/lab-short-keys", { params }),
  create: (data) => axios.post("/lab-short-keys", data),
  update: (id, data) => axios.put(`/lab-short-keys/${id}`, data),
  delete: (id) => axios.delete(`/lab-short-keys/${id}`),
};

export default labShortKeyService;
