import api from "./axios";

export const getPermissions = async () => {
    const res = await api.get("/permissions");
    return res.data?.data || [];
};
export const getPermissionById = async (id) => {
    const res = await api.get(`/permissions/${id}`);
    return res.data?.data || {};
}
export const createPermission = async (data) => {
    const res = await api.post("/permissions", data);
    return res.data?.data || {};
};

export const updatePermission = async (id, data) => {
    const res = await api.put(`/permissions/${id}`, data);
    return res.data?.data || {};
};

export const DeletePermission = async (id) => {
    const res = await api.delete(`/permissions/${id}`);
    return res.data?.data || {};
};