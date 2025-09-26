import { z } from "zod";

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").optional(),
  lastName: z.string().min(1, "Last name cannot be empty").optional(),
  email: z.string().email("Invalid email format").optional(),
}).refine(
  (data) => data.firstName !== undefined || data.lastName !== undefined || data.email !== undefined,
  {
    message: "At least one field (firstName, lastName, or email) must be provided",
  }
);
