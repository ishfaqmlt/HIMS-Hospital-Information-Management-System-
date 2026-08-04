import api from "./axios";

const testParameterService = {
  getAll: (params) => api.get("/lab-master-test-parameters", { params }),
  getById: (id) => api.get(`/lab-master-test-parameters/${id}`),
  create: (data) => api.post("/lab-master-test-parameters", data),
  update: (id, data) => api.put(`/lab-master-test-parameters/${id}`, data),
  delete: (id) => api.delete(`/lab-master-test-parameters/${id}`),
};

export default testParameterService;

// Keep old exports for backward compatibility
export const getTestparameters = async (master_test_id) => {
  const res = await api.get("/lab-master-test-parameters", { params: { master_test_id } });
  return res.data || [];
};

export const createTestparameter = async (data) => {
  const res = await api.post("/lab-master-test-parameters", data);
  return res.data?.data || {};
};

export const updateTestparameter = async (id, data) => {
  const res = await api.put(`/lab-master-test-parameters/${id}`, data);
  return res.data?.data || {};
};
