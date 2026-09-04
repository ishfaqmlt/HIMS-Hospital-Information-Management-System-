import api from "./axios";

export const getLabProfiles = async () => {
  const res = await api.get("/lab-profile");
  return res.data?.data || [];
};

export const getLabProfileById = async (id) => {
  const res = await api.get(`/lab-profile/${id}`);
  return res.data?.data || null;
};

export const createLabProfile = async (labProfileData) => {
  try {
    const res = await api.post("/lab-profile", labProfileData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};

export const updateLabProfile = async (id, labProfileData) => {
  try {
    const res = await api.put(`/lab-profile/${id}`, labProfileData);
    return res.data?.data || {};
  } catch (error) {
    throw error;
  }
};

export const deleteLabProfile = async (id) => {
  try {
    const res = await api.delete(`/lab-profile/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
