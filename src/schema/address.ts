import { z } from "zod";

// Create address schema
export const createAddressSchema = z.object({
  type: z.enum(
    ["SHIPPING", "BILLING"],
    "Type must be either SHIPPING or BILLING"
  ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

// Update address schema
export const updateAddressSchema = z.object({
  type: z.enum(
    ["SHIPPING", "BILLING"],
    "Type must be either SHIPPING or BILLING"
  ).optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  company: z.string().optional(),
  street: z.string().min(1, "Street address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  postalCode: z.string().min(1, "Postal code is required").optional(),
  country: z.string().min(1, "Country is required").optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  }
);
