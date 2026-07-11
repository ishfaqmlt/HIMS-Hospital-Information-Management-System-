import api from "./axios";

export const getRequiredSamples = async () => {
    const res = await api.get("/required-samples");
    return res.data?.data || [];
};