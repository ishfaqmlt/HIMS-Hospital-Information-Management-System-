import axios from "@/lib/axios";

const reportService = {
  getPaymentSummary: (params) => axios.get("/reports/payments/summary", { params }),
  getDepartmentRevenue: (params) => axios.get("/reports/payments/department-wise", { params }),
  getPatientDues: (params) => axios.get("/reports/payments/patient-dues", { params }),
  getDoctorShareSummary: (params) => axios.get("/reports/doctor-shares/summary", { params }),
  getDoctorShareDetailed: (params) => axios.get("/reports/doctor-shares/detailed", { params }),
};

export default reportService;
