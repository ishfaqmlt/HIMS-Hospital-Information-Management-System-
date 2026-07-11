import api from "@/lib/axios";

const permissionService = {
  getAll: () => api.get("/permissions"),
};

export default permissionService;
