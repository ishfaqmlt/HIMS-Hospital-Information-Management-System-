import api from "./axios";

export const getBranches = async () => {
  const res = await api.get("/branches");
  return res.data?.data || [];
};

export const getBranchById = async (id) => {
  const res = await api.get(`/branches/${id}`);
  return res.data?.data || null;
};

export const createBranch = async (branchData) => {
  try {
    const res = await api.post("/branches", branchData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};

export const updateBranch = async (id, branchData) => {
  try {
    const res = await api.put(`/branches/${id}`, branchData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};
