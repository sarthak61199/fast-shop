import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import prisma from "./db.js";
import { JWT_SECRET } from "./env.js";

export const jwtAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  // Check if Authorization header is present
  if (!authHeader) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  // Check if it starts with Bearer
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  // Run the jwt middleware to verify the token
  const jwtMiddleware = jwt({ secret: JWT_SECRET });
  await jwtMiddleware(c, async () => {
    const payload = c.get("jwtPayload");

    if (!payload) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    // Check user in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new HTTPException(401, {
        message: "User not found or inactive",
      });
    }

    // Attach user to context
    c.set("user", user);

    await next();
  });
};

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  // Assuming jwtAuth has already set the user
  if (!user) {
    // This shouldn't happen if jwtAuth is used first, but safety
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  if (user.role !== "ADMIN") {
    throw new HTTPException(403, {
      message: "Forbidden",
    });
  }

  await next();
};
