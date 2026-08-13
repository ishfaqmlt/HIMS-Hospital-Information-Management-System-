import api from "./axios";

const hospitalOutputSettingService = {
  get: () => api.get("/hospital-output-settings"),
  update: (data) => api.put("/hospital-output-settings", data),
  uploadImage: (formData) =>
    api.post("/hospital-output-settings/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default hospitalOutputSettingService;
