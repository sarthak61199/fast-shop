import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwtAuth } from "../lib/auth.js";
import prisma from "../lib/db.js";
import { createAddressSchema, updateAddressSchema } from "../schema/address.js";
import type { SessionUser } from "../types.js";

const addressController = new Hono<{
  Variables: {
    user: SessionUser;
  };
}>();

addressController.get("/", jwtAuth, async (c) => {
  const user = c.get("user");

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      type: true,
      firstName: true,
      lastName: true,
      company: true,
      street: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      phone: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    error: false,
    message: "Addresses retrieved",
    data: {
      addresses,
    },
  });
});

addressController.post(
  "/",
  jwtAuth,
  zValidator("json", createAddressSchema),
  async (c) => {
    const user = c.get("user");
    const addressData = c.req.valid("json");

    // If this address is being set as default, unset any existing default for this type
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          type: addressData.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create the new address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        type: addressData.type,
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        company: addressData.company || null,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone || null,
        isDefault: addressData.isDefault,
      },
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        company: true,
        street: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json(
      {
        error: false,
        message: "Address created",
        data: {
          address,
        },
      },
      201
    );
  }
);

addressController.put(
  "/:id",
  jwtAuth,
  zValidator("json", updateAddressSchema),
  async (c) => {
    const user = c.get("user");
    const addressId = c.req.param("id");
    const updateData = c.req.valid("json");

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      throw new HTTPException(404, {
        message: "Address not found",
      });
    }

    // Handle isDefault logic
    if (updateData.isDefault === true) {
      // Unset existing default for the same type (use existing type if not changing, or new type if changing)
      const targetType = updateData.type || existingAddress.type;

      await prisma.address.updateMany({
        where: {
          userId: user.id,
          type: targetType,
          isDefault: true,
          id: { not: addressId }, // Don't unset the one we're updating
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Prepare update data, converting undefined to null for optional fields
    const updatePayload: any = {};
    if (updateData.type !== undefined) updatePayload.type = updateData.type;
    if (updateData.firstName !== undefined)
      updatePayload.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      updatePayload.lastName = updateData.lastName;
    if (updateData.company !== undefined)
      updatePayload.company = updateData.company || null;
    if (updateData.street !== undefined)
      updatePayload.street = updateData.street;
    if (updateData.city !== undefined) updatePayload.city = updateData.city;
    if (updateData.state !== undefined) updatePayload.state = updateData.state;
    if (updateData.postalCode !== undefined)
      updatePayload.postalCode = updateData.postalCode;
    if (updateData.country !== undefined)
      updatePayload.country = updateData.country;
    if (updateData.phone !== undefined)
      updatePayload.phone = updateData.phone || null;
    if (updateData.isDefault !== undefined)
      updatePayload.isDefault = updateData.isDefault;

    // Update the address
    const address = await prisma.address.update({
      where: { id: addressId },
      data: updatePayload,
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        company: true,
        street: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json({
      error: false,
      message: "Address updated",
      data: {
        address,
      },
    });
  }
);

addressController.delete("/:id", jwtAuth, async (c) => {
  const user = c.get("user");
  const addressId = c.req.param("id");

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
  });

  if (!existingAddress) {
    throw new HTTPException(404, {
      message: "Address not found",
    });
  }

  // Delete the address
  await prisma.address.delete({
    where: { id: addressId },
  });

  return c.json({
    error: false,
    message: "Address deleted",
    data: {},
  });
});

addressController.put("/:id/default", jwtAuth, async (c) => {
  const user = c.get("user");
  const addressId = c.req.param("id");

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
  });

  if (!existingAddress) {
    throw new HTTPException(404, {
      message: "Address not found",
    });
  }

  // If address is already default, just return it (idempotent)
  if (existingAddress.isDefault) {
    return c.json({
      error: false,
      message: "Default address set",
      data: {
        address: existingAddress,
      },
    });
  }

  // Unset existing default for the same type
  await prisma.address.updateMany({
    where: {
      userId: user.id,
      type: existingAddress.type,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  // Set this address as default
  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: {
      isDefault: true,
    },
    select: {
      id: true,
      type: true,
      firstName: true,
      lastName: true,
      company: true,
      street: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      phone: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return c.json({
    error: false,
    message: "Default address set",
    data: {
      address: updatedAddress,
    },
  });
});

export default addressController;
