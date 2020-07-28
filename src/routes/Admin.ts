import { Router, Request, Response, NextFunction } from "express";

import {
  renderSignIn,
  doSignIn,
  doSignOut,
  renderRegistration,
  registrationFormValidation,
  doRegister,
  renderUsers,
} from "../controllers/Admin";

import { isAuthorized } from "../controllers/Authorize";
import logger from "@shared/Logger";

const router = Router();

/************************************************************************************
 *                             Admin UI HTTP resources
 *  - RBAC
 *  - jwt-oauth2 using public/private keys
 *
 ***********************************************************************************/

// set Admin root
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  logger.debug("ENTER admin root - '/'");
  logger.debug(JSON.stringify(req.session));
  if (!req.session || !req.session.user) {
    return res.redirect("/sign-in");
  }
  res.render("index", {
    location: "home",
    title: "TaskPal service.",
    loggedInUser: req.session.user,
  });
});

/**
 * Get sign-in page
 */
router.get("/sign-in", [renderSignIn]);

/**
 * Submit sign-in requeset.
 *
 * Admin login - allow 'Admin' and 'SuperAdmin' users roles only.
 * 'Admin' users can access data/resources associated with it's clientId,
 * 'SuperAdmin' owns the system.
 *
 *  Steps:
 *  - sign-in and store session user info.
 *  - check if user role is authorized to procceed. Otherwise, logout.
 */
router.post("/sign-in", [
  doSignIn,
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
]);

/**
 * logout
 *
 */
router.get("/sign-out", [doSignOut]);

/**
 * sign-up user to organization role, assigns clientId as merchant-id.
 *
 */
router.get("/register", [
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
  renderRegistration,
]);

/**
 * commit user sign-up
 *
 */
router.post(
  "/register",
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
  registrationFormValidation,
  doRegister
);

router.get(
  "/users",
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
  renderUsers
);

export default router;
