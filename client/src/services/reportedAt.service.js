import api from "./axios";

export const getReportedAts = async () => {
    const res = await api.get("/reported-ats");
    return res.data?.data || [];
};