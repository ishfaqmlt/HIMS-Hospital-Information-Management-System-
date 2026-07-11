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

export const departmentSchema = z.object({
  department_name: z
    .string()
    .min(2, "Department name must be at least 2 characters long"),
  isActive: z.coerce.boolean().default(true),
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

export const doctorSchema = z.object({
  doctorName: z.string().min(1, "Doctor name is required"),
  specialization: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  commissionPercentage: z.coerce.number().min(0).max(100).optional(),
  isActive: z.coerce.boolean(),
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
