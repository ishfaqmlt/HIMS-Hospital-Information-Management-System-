import api from "./axios";

export const getCollectionCenters = async () => {
  const res = await api.get("/collection-centers");
  return res.data?.data || [];
};

export const getCollectionCenterById = async (id) => {
  const res = await api.get(`/collection-centers/${id}`);
  return res.data?.data || null;
};

export const createCollectionCenter = async (centerData) => {
  try {
    const res = await api.post("/collection-centers", centerData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};

export const updateCollectionCenter = async (id, centerData) => {
  try {
    const res = await api.put(`/collection-centers/${id}`, centerData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};
