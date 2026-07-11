import api from "./axios";

export const getSamplePerforms = async () => {
    const res = await api.get("/sample-performs");
    return res.data?.data || [];
};