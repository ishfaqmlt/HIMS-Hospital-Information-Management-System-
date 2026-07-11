import api from "@/lib/axios";

const hospitalProfileService = {
  get: () => api.get("/hospital-profile"),
  create: (data) => api.post("/hospital-profile", data),
  update: (data) => api.put("/hospital-profile", data),
  delete: () => api.delete("/hospital-profile"),
};

export default hospitalProfileService;
