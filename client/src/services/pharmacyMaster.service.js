import axios from "@/lib/axios";

export const pharmacyUnitService = {
  getAll: (params) => axios.get("/pharmacy-units", { params }),
  getById: (id) => axios.get(`/pharmacy-units/${id}`),
  create: (data) => axios.post("/pharmacy-units", data),
  update: (id, data) => axios.put(`/pharmacy-units/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-units/${id}`),
};

export const pharmacyDosageFormService = {
  getAll: (params) => axios.get("/pharmacy-dosage-forms", { params }),
  getById: (id) => axios.get(`/pharmacy-dosage-forms/${id}`),
  create: (data) => axios.post("/pharmacy-dosage-forms", data),
  update: (id, data) => axios.put(`/pharmacy-dosage-forms/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-dosage-forms/${id}`),
};

export const pharmacyCategoryService = {
  getAll: (params) => axios.get("/pharmacy-categories", { params }),
  getById: (id) => axios.get(`/pharmacy-categories/${id}`),
  create: (data) => axios.post("/pharmacy-categories", data),
  update: (id, data) => axios.put(`/pharmacy-categories/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-categories/${id}`),
};

export const pharmacyGenericService = {
  getAll: (params) => axios.get("/pharmacy-generics", { params }),
  getById: (id) => axios.get(`/pharmacy-generics/${id}`),
  create: (data) => axios.post("/pharmacy-generics", data),
  update: (id, data) => axios.put(`/pharmacy-generics/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-generics/${id}`),
};

export const pharmacyManufacturerService = {
  getAll: (params) => axios.get("/pharmacy-manufacturers", { params }),
  getById: (id) => axios.get(`/pharmacy-manufacturers/${id}`),
  create: (data) => axios.post("/pharmacy-manufacturers", data),
  update: (id, data) => axios.put(`/pharmacy-manufacturers/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-manufacturers/${id}`),
};

const pharmacyMasterService = {
  units: pharmacyUnitService,
  dosageForms: pharmacyDosageFormService,
  categories: pharmacyCategoryService,
  generics: pharmacyGenericService,
  manufacturers: pharmacyManufacturerService,
};

export default pharmacyMasterService;
