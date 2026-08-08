import api from "./axios";

const acceptSampleService = {
  getAll: (params) => api.get("/accept-sample", { params }),
  acceptSample: (testId) => api.put(`/accept-sample/${testId}/accept`),
  rejectSample: (testId, data) => api.put(`/accept-sample/${testId}/reject`, data),
};

export default acceptSampleService;
