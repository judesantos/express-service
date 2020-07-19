import { Router } from "express";

import { isAuthorized } from "../middlewares/authorize";
import { isAuthenticated } from "../middlewares/authenticate";
import { find, create, update, remove } from "../controllers/Users";

const router = Router();

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get("/all", [isAuthorized, isAuthenticated, find]);

/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post("/add", [isAuthorized, isAuthenticated, create]);

/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put("/update", [isAuthorized, isAuthenticated, update]);

/******************************************************************************
 *                    Delete - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete("/delete/:id", [isAuthorized, isAuthenticated, remove]);

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
