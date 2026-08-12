import api from "./axios";

const labOutputSettingService = {
  get: () => api.get("/lab-output-settings"),
  update: (data) => api.put("/lab-output-settings", data),
  uploadImage: (formData) =>
    api.post("/lab-output-settings/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default labOutputSettingService;
