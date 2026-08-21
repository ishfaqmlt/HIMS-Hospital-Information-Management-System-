import axios from "@/lib/axios";

const labAnalyzerDataService = {
  getAll: (params) => axios.get("/lab-analyzer-data", { params }),
  getByReffNo: (reffNo) => axios.get(`/lab-analyzer-data/reff-no/${encodeURIComponent(reffNo)}`),
  markSynced: (data) => axios.post("/lab-analyzer-data/mark-synced", data),
};

export default labAnalyzerDataService;
