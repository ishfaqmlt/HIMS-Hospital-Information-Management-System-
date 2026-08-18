import axios from "@/lib/axios";

const cashHandoverService = {
  getAll: (params) => axios.get("/cash-handovers", { params }),
  getCurrentSummary: () => axios.get("/cash-handovers/current-summary"),
  create: (data) => axios.post("/cash-handovers", data),
  accept: (id) => axios.post(`/cash-handovers/${id}/accept`),
  reject: (id) => axios.post(`/cash-handovers/${id}/reject`),
};

export default cashHandoverService;
