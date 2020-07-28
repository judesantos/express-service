import * as express from "express";

import { login, logout } from "../controllers/Auth";
import { apiIsAuthenticated } from "@controllers/Authenticate";

const router = express.Router();

router.post("/login", [apiIsAuthenticated, login]);

router.get("/logout", [logout]);

export default router;
