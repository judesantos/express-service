import path from "path";
import fs from "fs";

import * as bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import express, { Request, Response, NextFunction } from "express";

import logger from "@lib/Logger";
import DbContext from "./dbs/DbContext";

import env from "../.env";

// Init express
const app = express();

/************************************************************************************
 *
 *                              Setup app dependencies
 *
 ***********************************************************************************/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// use morgan for http tracing

if (env.isProduction) {
  // security

  app.use(helmet());

  // log to file in production

  app.use(
    morgan("common", {
      skip: function (req, res) {
        return res.statusCode === 200;
      },
      stream: fs.createWriteStream(
        path.join(__dirname, env.logging.commonLogPath),
        { flags: "a" }
      ),
    })
  );
  app.use(
    morgan("errors", {
      skip: function (req, res) {
        return res.statusCode > 200;
      },
      stream: fs.createWriteStream(
        path.join(__dirname, env.logging.errorLogPath),
        { flags: "a" }
      ),
    })
  );
} else {
  // log to console in dev
  app.use(morgan("dev"));
}

/************************************************************************************
 *
 *                              Setup db, routes
 *
 ***********************************************************************************/

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
