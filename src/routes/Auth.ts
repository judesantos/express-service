import * as express from "express";
import { login, logout } from "../controllers/Auth";
import { isAuthorized } from "../middlewares/authorize";
import { UserRoles } from "@models/User";

const router = express.Router();

/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

router.post("/login", [isAuthorized, login]);

/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

//router.get("/logout", [isAuthorized, isAuthenticated, logout]);
router.get("/logout", [logout]);

/******************************************************************************
 *                                 Export Router
 ******************************************************************************/

export default router;
