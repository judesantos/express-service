import * as express from "express";

import UserRouter from "./Users";
import AuthRouter from "./Auth";

// Init router and path
const router = express.Router();
// Add sub-routes
router.use("/users", UserRouter);
router.use("/auth", AuthRouter);

// Export the base-router
module.exports = router;
