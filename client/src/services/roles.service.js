import api from "./axios";

export const getRoles = async () => {
    const res = await api.get("/roles");
    return res.data?.data || [];
};
export const getRoleById = async (id) => {
    const res = await api.get(`/roles/${id}`);
    return res.data?.data || {};
}
export const createRole = async (data) => {
    const res = await api.post("/roles", data);
    return res.data?.data || {};
};

export const updateRole = async (id, data) => {
    const res = await api.put(`/roles/${id}`, data);
    return res.data?.data || {};
};

export const deleteRole = async (id) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data?.data || {};
};
