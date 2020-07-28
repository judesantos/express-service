import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import flash from "connect-flash";

import express, { Request, Response, NextFunction } from "express";

import logger from "@shared/Logger";
import DbContext from "./dbs/DbContext";
import env from "../env";

const debug = require("debug")("taskpal-service:app");

// Init express
const app = express();

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// session config
app.use(
  session({
    secret: env.salt,
    cookie: {
      maxAge: env.session.expires as number,
      secure: env.session.secure === "true" ? true : false,
    },
    saveUninitialized: false,
    resave: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

// view engine setup
app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
require("./utils/hbs-helpers");

// Get DB connection going before we initialize app server.
// Doing otherwise would cause db connection attempt to hang.

DbContext.getInstance()
  .init()
  .then(() => {
    // setup routes
    app.use(require("./routes"));

    // error handler

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      // show errors on non-prod deployment
      logger.warn("Request error: " + err.message);
      // show error
      res.status(err.status || 500).json(err);
    });
  })
  .catch((err) => {
    logger.error("Server initialization exception: " + err + "!\n\tExeunt...");
  });

// Export express instance
export default app;
