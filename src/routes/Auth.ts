import { Router } from "express";
import { login, logout } from "../controllers/Auth";
import { isAuthorized } from "../middlewares/authorize";
import { isAuthenticated } from "../middlewares/authenticate";

const router = Router();

/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

router.post("/login", [isAuthorized, login]);

/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

router.get("/logout", [isAuthorized, isAuthenticated, logout]);

/******************************************************************************
 *                                 Export Router
 ******************************************************************************/

export default router;
