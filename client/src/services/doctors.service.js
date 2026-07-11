import api from "./axios";

export const getDoctors = async () => {
    const res = await api.get("/doctors");
    return res.data?.data || [];
};

export const createDoctor = async (doctorData) => {
    try {
        const res = await api.post("/doctors", doctorData);
        return res.data?.data || {};
    } catch (error) {
        throw error;
    }
};

export const updateDoctor = async (id, doctorData) => {
    try {
        const res = await api.put(`/doctors/${id}`, doctorData);
        return res.data?.data || {};
    } catch (error) {
        throw error;
    }
};
