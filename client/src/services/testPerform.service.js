import axios from "@/lib/axios";

const testPerformService = {
  getAll: (params) => axios.get("/test-perform", { params }),
  getParameters: (testId, params) => axios.get(`/test-perform/${testId}/parameters`, { params }),
  getResults: (testId) => axios.get(`/lab-cases/${testId}/results`),
  storeResults: (testId, data) => axios.post(`/lab-cases/${testId}/results`, data),
  updateTestStatus: (testId, data) => axios.put(`/lab-cases/tests/${testId}/status`, data),
};

export default testPerformService;
