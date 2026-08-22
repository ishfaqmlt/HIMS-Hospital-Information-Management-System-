import api from "@/lib/axios";

const hospitalProfileService = {
  get: () => api.get("/hospital-profile"),
  create: (data) =>
    api.post("/hospital-profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (data) =>
    api.post("/hospital-profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: () => api.delete("/hospital-profile"),
};

export default hospitalProfileService;
