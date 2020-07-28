import * as express from "express";

import { apiIsAuthorized } from "@controllers/Authorize";
import { apiIsAuthenticated } from "@controllers/Authenticate";
import { find, findAll } from "@controllers/Users";

const router = express.Router();

router.get("/all", [
  apiIsAuthenticated,
  apiIsAuthorized({
    hasRole: ["SuperAdmin", "Admin", "Manager", "Supervisor"],
  }),
  findAll,
]);

router.get("/", [
  apiIsAuthenticated,
  apiIsAuthorized({
    hasRole: ["SuperAdmin", "Admin", "Manager", "Supervisor"],
  }),
  find,
]);

export default router;
