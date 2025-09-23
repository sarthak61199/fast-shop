import { Hono } from "hono";

const cartController = new Hono();

cartController.get("/", async (c) => {});

cartController.post("/items", async (c) => {});

cartController.put("/items/:id", async (c) => {});

cartController.delete("/items/:id", async (c) => {});

cartController.delete("/", async (c) => {});

export default cartController;
