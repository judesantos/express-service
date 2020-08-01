import { Router, Request, Response, NextFunction } from "express";

import UsersRouter from "./Users";

// Init routes
const router = Router();
const service = Router();

// API routes

service.use("/users", UsersRouter);

router.use("/api/v1", service);

module.exports = router;
