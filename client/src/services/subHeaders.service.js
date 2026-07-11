import api from "./axios";

export const getSubHeaders = async () => {
    const res = await api.get("/sub-headers");
    return res.data?.data || [];
};

export const getSubHeaderById = async (id) => {
    const res = await api.get(`/sub-headers/${id}`);
    return res.data?.data || {};
};

export const createSubHeader = async (data) => {
    const res = await api.post("/sub-headers", data);
    return res.data?.data || {};
};

export const updateSubHeader = async (id, data) => {
    const res = await api.put(`/sub-headers/${id}`, data);
    return res.data?.data || {};
};

// export const deleteSubHeader = async (id) => {
//     const res = await api.delete(`/sub-headers/${id}`);
//     return res.data?.data || {};
// };