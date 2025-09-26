import { Hono } from "hono";
import { jwtAuth } from "../lib/auth.js";
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

userController.put("/profile", async (c) => {});

export default userController;
