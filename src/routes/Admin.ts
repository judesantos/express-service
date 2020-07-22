import { Router } from "express";

import { isAuthorized } from "../controllers/Authorize";
import {
  renderSignIn,
  doSignIn,
  doSignOut,
  renderRegistration,
  registrationFormValidation,
  doRegister,
} from "../controllers/Admin";

const router = Router();

/************************************************************************************
 *                             Admin UI HTTP resources
 *  - RBAC
 *  - jwt-oauth2 using public/private keys
 *
 ***********************************************************************************/

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
router.post("/sign-in", [doSignIn]);

router.get("/sign-out", [doSignOut]);

router.get("/register", [
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
  renderRegistration,
]);

router.post("/register", registrationFormValidation, [
  isAuthorized({ hasRole: ["SuperAdmin", "Admin"] }),
  doRegister,
]);

module.exports = router;
