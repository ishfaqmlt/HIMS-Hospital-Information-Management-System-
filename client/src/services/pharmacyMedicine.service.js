import axios from "@/lib/axios";

const pharmacyMedicineService = {
  getAll: (params) => axios.get("/pharmacy-medicines", { params }),
  getById: (id) => axios.get(`/pharmacy-medicines/${id}`),
  getByBarcode: (barcode) => axios.get(`/pharmacy-medicines/barcode/${barcode}`),
  generateBarcode: () => axios.get("/pharmacy-medicines/generate-barcode"),
  create: (data) => axios.post("/pharmacy-medicines", data),
  update: (id, data) => axios.put(`/pharmacy-medicines/${id}`, data),
  delete: (id) => axios.delete(`/pharmacy-medicines/${id}`),
};

export default pharmacyMedicineService;
