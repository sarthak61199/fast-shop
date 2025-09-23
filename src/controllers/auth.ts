import { zValidator } from "@hono/zod-validator";
import { hash, verify } from "@node-rs/argon2";
import { randomBytes } from "crypto";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";

import prisma from "../lib/db.js";
import { JWT_SECRET } from "../lib/env.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schema/auth.js";

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
      throw new HTTPException(400, {
        message: "User with this email already exists",
      });
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
    throw new HTTPException(401, {
      message: "Invalid email or password",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw new HTTPException(401, {
      message: "Account is deactivated",
    });
  }

  // Verify password
  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    throw new HTTPException(401, {
      message: "Invalid email or password",
    });
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

// Forgot password route
authController.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid("json");

    // Check if user exists (but don't reveal this information)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      throw new HTTPException(400, {
        message:
          "If an account with this email exists, a reset token has been sent.",
      });
    }

    // Clean up expired tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    // Generate secure reset token
    const resetToken = randomBytes(32).toString("hex");
    const hashedToken = await hash(resetToken);

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Create reset token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Log token for development/demo purposes
    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);
    console.log(`📧 This token expires at: ${expiresAt.toISOString()}`);

    return c.json({
      error: false,
      message:
        "If an account with this email exists, a reset token has been sent.",
      data: {},
    });
  }
);

// Reset password route
authController.post(
  "/reset-password",
  zValidator("json", resetPasswordSchema),
  async (c) => {
    const { token, newPassword } = c.req.valid("json");

    // Find valid reset token
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!resetTokenRecord) {
      throw new HTTPException(400, {
        message: "Invalid or expired reset token",
      });
    }

    // Verify the token
    const isValidToken = await verify(resetTokenRecord.token, token);
    if (!isValidToken) {
      throw new HTTPException(400, {
        message: "Invalid or expired reset token",
      });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword);

    // Update user password in a transaction
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return c.json({
      error: false,
      message: "Password has been reset successfully",
      data: {},
    });
  }
);

export default authController;
