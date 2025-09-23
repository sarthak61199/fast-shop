import { z } from "zod";

// Environment variables schema
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Export individual env vars for convenience
export const {
  DATABASE_URL,
  JWT_SECRET,
  NODE_ENV,
} = env;
