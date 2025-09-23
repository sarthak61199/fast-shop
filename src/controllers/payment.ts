import { Hono } from "hono";

const paymentController = new Hono();

paymentController.get("/", async (c) => {});

paymentController.post("/", async (c) => {});

paymentController.put("/:id/default", async (c) => {});

paymentController.delete("/:id", async (c) => {});

export default paymentController;
