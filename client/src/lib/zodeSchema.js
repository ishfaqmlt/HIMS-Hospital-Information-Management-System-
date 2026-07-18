import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

export const doctorSchema = z.object({
  Name: z.string().min(1, "Doctor name is required").max(100),
  Gender: z.enum(["Male", "Female", "Other"]).optional(),
  Dob: z.string().optional(),
  Email: z.string().email("Invalid email").optional().or(z.literal("")),
  Phone: z.string().optional(),
  Cnic: z.string().optional(),
  RegistrationNo: z.string().optional(),
  Address: z.string().optional(),
  JoiningDate: z.string().optional(),
  EmployeementStatus: z.enum(["Active", "Resigned", "Terminated", "Retired"]).optional(),
  Stamp: z.string().optional(),
  Opd: z.coerce.boolean(),
  Surgeon: z.coerce.boolean(),
  Anesthetist: z.coerce.boolean(),
});

export const serviceSchema = z.object({
  Code: z.string().optional(),
  DepartmentId: z.string().min(1, "Department is required"),
  ServiceName: z.string().min(1, "Service name is required").max(50),
  DefaultCharges: z.coerce.number().min(0, "Charges must be positive"),
  isActive: z.coerce.boolean(),
  printToken: z.coerce.boolean(),
});

export const departmentSchema = z.object({
  DepartmentName: z.string().min(1, "Department name is required").max(50),
  ServingBy: z.enum(["Doctor", "Department"]),
  isActive: z.coerce.boolean(),
});

export const masterTestSchema = z.object({
  // UUID Foreign Keys
  department_id: z
    .string({ required_error: "Department is required" })
    .uuid("Invalid department"),

  required_sample_id: z
    .string({ required_error: "Required sample is required" })
    .uuid("Invalid required sample"),

  sample_performs_id: z
    .string({ required_error: "Sample performs is required" })
    .uuid("Invalid sample performs"),

  reported_ats_id: z
    .string({ required_error: "Reported AT is required" })
    .uuid("Invalid reported AT"),

  // Unique Strings
  testCode: z
    .string({ required_error: "Test code is required" })
    .min(1, "Test code is required")
    .max(50, "Test code too long"),

  testName: z
    .string({ required_error: "Test name is required" })
    .min(1, "Test name is required")
    .max(255, "Test name too long"),

  // Expected Time (store as number if possible)
  expectedTime: z.coerce.number().min(0).optional(),

  price: z.coerce.number().nonnegative("Price cannot be negative").default(0),

  interpretation: z.string().optional().nullable(),

  isActive: z.coerce.boolean(),
});
export const patientSchema = z.object({
  pName: z.string().min(1, "Patient name is required"),
  gName: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  cnic: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  allergy: z.string().optional(),
  isActive: z.coerce.boolean(),
});

export const testParameterSchema = z.object({
  master_test_id: z
    .string({ required_error: "Master test ID is required" })
    .uuid("Invalid Master Test ID"),

  sub_headers_id: z.string({ required_error: "Sub Header is required" }).uuid("Invalid Sub Header ID"),
  parameterName: z
    .string({ required_error: "Parameter name is required" })
    .min(1, "Parameter name is required")
    .max(255),

  defaultValue: z.string().optional().nullable(),

  units: z.string().optional().nullable(),

  resultDataType: z
    .string({ required_error: "Result data type is required" })
    .min(1, "Result data type is required")
    .max(255),

  digitFormat: z
    .enum(["0", "1", "2", "3"])
    .default("0"),

  resultTemplets: z.string().optional().nullable(),

  formula: z.string().optional().nullable(),

  analyzerCode: z.string().optional().nullable(),

  sortNo: z.coerce.number().int().optional(),

  printOnReciept: z.coerce.boolean(),

  isActive: z.coerce.boolean(),

  normalRange: z.string().optional().nullable(),
});

export const labProfileSchema = z.object({
  type: z.string().min(1, "Lab type is required"),
  name: z.string().min(1, "Lab name is required"),
  code: z.string().min(1, "Lab code is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  isActive: z.coerce.boolean(),
});

export const subHeaderSchema = z.object({
  sub_header_name: z.string().min(1, "Sub header name is required"),
});

export const branchSchema = z.object({
  branchCode: z.string().min(1, "Branch code is required"),
  branchName: z.string().min(1, "Branch name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().optional(),
  address: z.string().optional(),
  isMainBranch: z.coerce.boolean(),
  isActive: z.coerce.boolean(),
});

export const collectionCenterSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  centerName: z.string().min(1, "Center name is required"),
  centerCode: z.string().min(1, "Center code is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().optional(),
  address: z.string().optional(),
  isActive: z.coerce.boolean(),
});

export const hospitalProfileSchema = z.object({
  hospital_name: z.string().min(1, "Hospital name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  contact_person: z.string().optional(),
  contact_person_phone: z.string().optional(),
  footer_text: z.string().optional(),
  terms_conditions: z.string().optional(),
});

export const serviceChargeSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  ServiceId: z.string().min(1, "Service is required"),
  departmentId: z.string().min(1, "Department is required"),
  Charges: z.coerce.number().min(0, "Charges must be positive"),
  isSynced: z.coerce.boolean(),
});

export const appointmentMasterSchema = z.object({
  DoctorId: z.string().min(1, "Doctor is required"),
  Days: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])).min(1, "At least one day is required"),
  StartTime: z.string().min(1, "Start time is required"),
  EndTime: z.string().min(1, "End time is required"),
  SlotTime: z.coerce.number().min(1, "Slot time must be at least 1 minute"),
  BookingType: z.enum(["same day", "advance"]),
  SilentSlots: z.coerce.number().min(0),
  MaxBookings: z.coerce.number().min(0),
  isSynced: z.coerce.boolean(),
});

export const opdVisitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  DoctorId: z.string().min(1, "Doctor is required"),
  DepartmentId: z.string().optional(),
  VisitDate: z.string().min(1, "Visit date is required"),
  VisitNo: z.string().min(1, "Visit number is required").max(20),
  VisitType: z.enum(["OPD", "Followup", "Emergency"]),
  ConsultationFee: z.coerce.number().min(0, "Fee must be positive"),
  ChiefComplaint: z.string().optional(),
  Diagnosis: z.string().optional(),
  Notes: z.string().optional(),
  Status: z.enum(["Waiting", "In Progress", "Completed", "Cancelled"]),
  isPrescriptionGiven: z.coerce.boolean(),
});

export const ipdAdmissionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  DoctorId: z.string().min(1, "Doctor is required"),
  DepartmentId: z.string().optional(),
  AdmissionNo: z.string().min(1, "Admission number is required").max(20),
  AdmissionDate: z.string().min(1, "Admission date is required"),
  DischargeDate: z.string().optional(),
  RoomNo: z.string().optional(),
  BedNo: z.string().optional(),
  AdmissionType: z.enum(["Elective", "Emergency", "Transfer"]),
  Status: z.enum(["Admitted", "Discharged", "Transferred", "Cancelled"]),
  ChiefComplaint: z.string().optional(),
  Diagnosis: z.string().optional(),
  TreatmentPlan: z.string().optional(),
  DischargeSummary: z.string().optional(),
  TotalCharges: z.coerce.number().min(0, "Charges must be positive"),
  TotalPaid: z.coerce.number().min(0, "Paid amount must be positive"),
});

export const emergencyCaseSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  DoctorId: z.string().optional(),
  DepartmentId: z.string().optional(),
  CaseNo: z.string().min(1, "Case number is required").max(20),
  ArrivalDate: z.string().min(1, "Arrival date is required"),
  DischargeDate: z.string().optional(),
  Priority: z.enum(["Critical", "Urgent", "Standard"]),
  Status: z.enum(["Active", "Discharged", "Transferred", "Deceased", "Cancelled"]),
  ChiefComplaint: z.string().optional(),
  Diagnosis: z.string().optional(),
  Treatment: z.string().optional(),
  Notes: z.string().optional(),
  TotalCharges: z.coerce.number().min(0, "Charges must be positive"),
  TotalPaid: z.coerce.number().min(0, "Paid amount must be positive"),
});

export const billingSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  InvoiceNo: z.string().min(1, "Invoice number is required").max(20),
  InvoiceDate: z.string().min(1, "Invoice date is required"),
  InvoiceType: z.enum(["OPD", "IPD", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Other"]),
  SubTotal: z.coerce.number().min(0, "Sub total must be positive"),
  Discount: z.coerce.number().min(0, "Discount must be positive"),
  Tax: z.coerce.number().min(0, "Tax must be positive"),
  TotalAmount: z.coerce.number().min(0, "Total must be positive"),
  PaidAmount: z.coerce.number().min(0, "Paid amount must be positive"),
  PaymentStatus: z.enum(["Pending", "Partial", "Paid", "Cancelled"]),
  PaymentMethod: z.enum(["Cash", "Card", "BankTransfer", "Insurance", "Other"]),
  Notes: z.string().optional(),
});

export const pharmacySchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  InvoiceNo: z.string().min(1, "Invoice number is required").max(20),
  InvoiceDate: z.string().min(1, "Invoice date is required"),
  DoctorId: z.string().optional(),
  SubTotal: z.coerce.number().min(0, "Sub total must be positive"),
  Discount: z.coerce.number().min(0, "Discount must be positive"),
  Tax: z.coerce.number().min(0, "Tax must be positive"),
  TotalAmount: z.coerce.number().min(0, "Total must be positive"),
  PaidAmount: z.coerce.number().min(0, "Paid amount must be positive"),
  PaymentStatus: z.enum(["Pending", "Partial", "Paid", "Cancelled"]),
  PaymentMethod: z.enum(["Cash", "Card", "BankTransfer", "Insurance", "Other"]),
  Notes: z.string().optional(),
});
