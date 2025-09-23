import { Hono } from "hono";

const productController = new Hono();

productController.get("/", async (c) => {});

productController.get("/:id", async (c) => {});

productController.post("/", async (c) => {});

productController.put("/:id", async (c) => {});

productController.delete("/:id", async (c) => {});

export default productController;
