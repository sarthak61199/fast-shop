import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
