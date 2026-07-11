import api from "./axios";

export const getMasterTests = async (params) => {
  const res = await api.get("/master-tests", { params });
  return res.data?.data || [];
};

export const createMasterTest = async (data) => {
  const res = await api.post("/master-tests", data);
  return res.data?.data || {};
};

export const updateMasterTest = async (id, data) => {
  const res = await api.put(`/master-tests/${id}`, data);
  return res.data?.data || {};
};

