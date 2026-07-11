import api from "./axios";

export const getDepartments = async () => {
    const res = await api.get("/departments");
    return res.data?.data || [];
};
export const getDepartmentById = async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data?.data || {};
}
export const createDepartment = async (data) => {
    const res = await api.post("/departments", data);
    return res.data?.data || {};
};

export const updateDepartment = async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data?.data || {};
};
