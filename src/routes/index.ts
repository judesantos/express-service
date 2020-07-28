import { Router, Request, Response, NextFunction } from "express";

import AuthRouter from "./Auth";
import AdminRouter from "./Admin";
import UsersRouter from "./Users";
import logger from "@shared/Logger";
import env from "../../env";

// Init routes
const router = Router();
const service = Router();

// API routes

service.use("/auth", AuthRouter);
service.use("/users", UsersRouter);

router.use("/api/v1", service);

// admin UI

router.use("/", AdminRouter);

module.exports = router;
