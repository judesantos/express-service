import * as express from "express";
import { login, logout } from "../controllers/Auth";
import { isApiUserAuthenticated } from "../controllers/Authenticate";

const router = express.Router();

router.post("/login", [isApiUserAuthenticated, login]);

//router.get("/logout", [isAuthorized, isAuthenticated, logout]);
router.get("/logout", [logout]);

export default router;
