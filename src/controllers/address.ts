import { Hono } from "hono";

const addressController = new Hono();

addressController.get("/", async (c) => {});

addressController.post("/", async (c) => {});

addressController.put("/:id", async (c) => {});

addressController.delete("/:id", async (c) => {});

export default addressController;
