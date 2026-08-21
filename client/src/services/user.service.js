import api from "@/lib/axios";

const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  assignRole: (userId, role) => api.post(`/users/${userId}/role`, { role }),
  updateRoles: (userId, roles) => api.put(`/users/${userId}/roles`, { roles }),
  toggleStatus: (userId) => api.put(`/users/${userId}/status`),
};

export default userService;
