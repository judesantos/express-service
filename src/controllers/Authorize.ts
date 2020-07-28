import { Request, Response, NextFunction } from "express";
import { FORBIDDEN, OK } from "http-status-codes";

import {
  unauthorizedError,
  loginRequiredError,
  authorizationError,
} from "@shared/constants";

import logger from "@shared/Logger";

/**
 *
 * @param opts
 */
export const isAuthorized = (opts: {
  hasRole: Array<
    "SuperAdmin" | "Admin" | "Manager" | "Supervisor" | "Technician" | "User"
  >;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Entering middleware::isAuthorized()");
    const redirectLogin = () => res.redirect("/");

    if (!req!.session!.user) return redirectLogin();

    const { role, _id } = req!.session!.user;

    if (!_id || !role) return redirectLogin();

    let isAuthorized = false;
    if (opts.hasRole.includes(role)) {
      isAuthorized = true;
    }

    let error = { error: "Unauthorized user" } as any;
    let view = res.locals.view ? res.locals.view : "error";

    if ("sign-in" === view) {
      if (isAuthorized) {
        return res.redirect("/");
      } else {
        req!.session!.destroy(() => {});
      }
    }

    if (isAuthorized) {
      return next();
    } else if ("error" === view) {
      error = {
        error: {
          status: "Unauthorized user",
        },
        message: "Requires admin access",
      };
    }

    return res.render(view, error);
  };
};

/**
 *
 * @param opts
 */
export const apiIsAuthorized = (opts: {
  hasRole: Array<
    "SuperAdmin" | "Admin" | "Manager" | "Supervisor" | "Technician" | "User"
  >;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Enter middleware::apiIsAuthorized()");
    const redirectLogin = (msg: string) =>
      res.status(FORBIDDEN).json(msg ? msg : "Unauthorized access to resource");

    if (!req!.session!.user) return redirectLogin(loginRequiredError);

    const { role, _id } = req!.session!.user;

    if (!role) return redirectLogin(unauthorizedError);

    let isAuthorized = false;

    if (opts.hasRole.includes(role)) {
      isAuthorized = true;
    }

    if (isAuthorized) {
      if (res.locals.authorized) {
        if (true === res.locals.authorized) {
          delete res.locals.authorized;
          res.status(OK).json("Login Success");
        } else {
          logger.debug("apiIsAuthorized() - terminate this session!");
          req!.session!.destroy(() => {});
        }
      } else {
        logger.debug("Exit middleware::apiIsAuthorized()");
        return next();
      }
    }

    logger.debug("Exit middleware::apiIsAuthorized() - authorization error");
    return redirectLogin(authorizationError);
  };
};
