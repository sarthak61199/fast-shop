import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { HTTPException } from "hono/http-exception";
import addressController from "./controllers/address.js";
import authController from "./controllers/auth.js";
import cartController from "./controllers/cart.js";
import orderController from "./controllers/order.js";
import paymentController from "./controllers/payment.js";
import productController from "./controllers/product.js";
import userController from "./controllers/user.js";

const app = new Hono().basePath("/api/v1").onError((err, c) => {
  console.error(err);
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: true,
        message: err.message,
        data: {},
      },
      err.status
    );
  }

  return c.json(
    {
      error: true,
      message: "Internal server error",
      data: {},
    },
    500
  );
});

app.use(logger());
app.use(cors());
app.use(secureHeaders());

app.get("/health", (c) => {
  return c.json({
    error: false,
    message: "Server is running",
    data: {},
  });
});

app.route("/auth", authController);
app.route("/products", productController);
app.route("/orders", orderController);
app.route("/carts", cartController);
app.route("/payments", paymentController);
app.route("/addresses", addressController);
app.route("/users", userController);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
