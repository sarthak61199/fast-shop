import { zValidator } from "@hono/zod-validator";
import { hash, verify } from "@node-rs/argon2";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";

import prisma from "../lib/db.js";
import { JWT_SECRET } from "../lib/env.js";
import { loginSchema, registerSchema } from "../schema/auth.js";

const authController = new Hono();

// Register route
authController.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { email, password, firstName, lastName } = c.req.valid("json");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return c.json(
        {
          error: true,
          message: "User with this email already exists",
          data: {},
        },
        400
      );
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
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

    // Generate JWT token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      },
      JWT_SECRET
    );

    return c.json(
      {
        error: false,
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      },
      201
    );
  }
);

// Login route
authController.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return c.json(
      {
        error: true,
        message: "Invalid email or password",
        data: {},
      },
      401
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return c.json(
      {
        error: true,
        message: "Account is deactivated",
        data: {},
      },
      401
    );
  }

  // Verify password
  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    return c.json(
      {
        error: true,
        message: "Invalid email or password",
        data: {},
      },
      401
    );
  }

  // Generate JWT token
  const token = await sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    },
    JWT_SECRET
  );

  const userResponse = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return c.json({
    error: false,
    message: "Login successful",
    data: {
      user: userResponse,
      token,
    },
  });
});

// Refresh token route
authController.post("/refresh", jwt({ secret: JWT_SECRET }), async (c) => {
  const payload = c.get("jwtPayload");

  // Verify user still exists and is active
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

  // Generate new JWT token with fresh expiration
  const token = await sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
    },
    JWT_SECRET
  );

  return c.json({
    error: false,
    message: "Token refreshed successfully",
    data: {
      token,
    },
  });
});

authController.post("/forgot-password", async (c) => {
  return c.json(
    {
      error: true,
      message: "Not implemented yet",
      data: {},
    },
    501
  );
});

authController.post("/reset-password", async (c) => {
  return c.json(
    {
      error: true,
      message: "Not implemented yet",
      data: {},
    },
    501
  );
});

export default authController;
