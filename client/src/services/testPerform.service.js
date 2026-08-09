import axios from "@/lib/axios";

const testPerformService = {
  getAll: (params) => axios.get("/test-perform", { params }),
  getResults: (testId) => axios.get(`/lab-cases/${testId}/results`),
  storeResults: (testId, data) => axios.post(`/lab-cases/${testId}/results`, data),
};

export default testPerformService;
