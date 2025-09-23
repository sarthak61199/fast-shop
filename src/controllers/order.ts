import { Hono } from "hono";

const orderController = new Hono();

orderController.get("/", async (c) => {});

orderController.get("/:id", async (c) => {});

orderController.post("/", async (c) => {});

orderController.put("/:id/status", async (c) => {});

orderController.put("/:id/cancel", async (c) => {});

export default orderController;
