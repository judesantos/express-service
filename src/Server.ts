import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";

import express, { Request, Response, NextFunction } from "express";
import { BAD_REQUEST } from "http-status-codes";
import "express-async-errors";

import logger from "@shared/Logger";
import { cookieProps } from "@shared/constants";

import DbContext from "./dbs/DbContext";
import env from "../env";

const debug = require("debug")("taskpal-service:app");
// Init express
const app = express();

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/
/*
app.use(express.json());
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// session config
app.use(
  session({
    secret: env.salt,
    cookie: { maxAge: 60000, secure: false },
    saveUninitialized: true,
    resave: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(cookieProps.secret));
*/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// session config
app.use(
  session({
    secret: env.salt,
    cookie: { maxAge: 60000, secure: false },
    saveUninitialized: true,
    resave: true,
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

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

// Get DB connection going before we initialize app server.
// Doing otherwise would cause db connection attempt to hang.

DbContext.getInstance()
  .init()
  .then(() => {
    // setup main route
    const service = express();
    // now load the routes
    app.use("/api/v1", service);

    service.use(require("./routes"));

    // Print API errors
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
        error: err.message,
      });
    });

    // default routes
    app.get("/", (req: Request, res: Response) => {
      logger.info("Enter base route '/'");
      res.sendFile("login.html", { root: viewsDir });
    });

    app.get("/users", (req: Request, res: Response) => {
      logger.info("Enter route '/users'");
      const jwt = req.signedCookies[cookieProps.key];
      if (!jwt) {
        res.redirect("/");
      } else {
        res.sendFile("users.html", { root: viewsDir });
      }
    });
  })
  .catch((err) => {
    logger.error("Server initialization exception: " + err + "!\n\tExeunt...");
  });

// Export express instance
export default app;
