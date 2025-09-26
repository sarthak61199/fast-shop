import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwtAuth } from "../lib/auth.js";
import prisma from "../lib/db.js";
import { updateProfileSchema } from "../schema/user.js";
import type { SessionUser } from "../types.js";

const userController = new Hono<{
  Variables: {
    user: SessionUser;
  };
}>();

userController.get("/profile", jwtAuth, async (c) => {
  const user = c.get("user");

  return c.json({
    error: false,
    message: "Profile retrieved",
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

userController.put(
  "/profile",
  jwtAuth,
  zValidator("json", updateProfileSchema),
  async (c) => {
    const user = c.get("user");
    const { firstName, lastName, email } = c.req.valid("json");

    // Check if email is being updated and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        throw new HTTPException(409, {
          message: "Email already in use",
        });
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json({
      error: false,
      message: "Profile updated",
      data: {
        user: updatedUser,
      },
    });
  }
);

export default userController;
