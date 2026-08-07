import api from "./axios";

const labCaseService = {
  getAll: (params) => api.get("/lab-cases", { params }),
  getById: (id) => api.get(`/lab-cases/${id}`),
  create: (data) => api.post("/lab-cases", data),
  update: (id, data) => api.put(`/lab-cases/${id}`, data),
  delete: (id) => api.delete(`/lab-cases/${id}`),
  removeTests: (caseId, testIds) => api.delete(`/lab-cases/${caseId}/tests`, { data: { testIds } }),
  addTests: (caseId, tests) => api.post(`/lab-cases/${caseId}/tests`, { tests }),
  updateTestStatus: (testId, data) => api.put(`/lab-cases/tests/${testId}/status`, data),
  storeResults: (testId, data) => api.post(`/lab-cases/${testId}/results`, data),
  getResults: (testId) => api.get(`/lab-cases/${testId}/results`),
  getWaitingInvoices: (params) => api.get("/lab-cases/waiting-invoices", { params }),
};

export default labCaseService;
