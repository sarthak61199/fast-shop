import { Hono } from "hono";

const userController = new Hono();

userController.get("/profile", async (c) => {});

userController.put("/profile", async (c) => {});

export default userController;
