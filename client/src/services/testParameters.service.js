import api from "./axios";

export const getTestparameters = async (master_test_id) => {
  const res = await api.get(`/test-parameters/${master_test_id}`);
  return res.data?.data || [];
};

export const createTestparameter = async (data) => {
  const res = await api.post("/test-parameters", data);
  return res.data?.data || {};
};

export const updateTestparameter = async (id, data) => {
  const res = await api.put(`/test-parameters/${id}`, data);
  return res.data?.data || {};
};

