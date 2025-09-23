import { Hono } from "hono";

const authController = new Hono();

authController.post("/register", async (c) => {});

authController.post("/login", async (c) => {});

authController.post("/refresh", async (c) => {});

authController.post("/forgot-password", async (c) => {});

authController.post("/reset-password", async (c) => {});

export default authController;
