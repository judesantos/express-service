import * as express from "express";

import { isAuthorized } from "../controllers/Authorize";
import { isAuthenticated } from "../controllers/Authenticate";
import { find, create, update, remove } from "../controllers/Users";

const router = express.Router();

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get("/all", [isAuthenticated, find]);

/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post("/add", [isAuthenticated, create]);

/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put("/update", [isAuthenticated, update]);

/******************************************************************************
 *                    Delete - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete("/delete/:id", [isAuthenticated, remove]);

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
