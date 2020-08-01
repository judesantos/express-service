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

    if (!res.locals.user) return redirectLogin();

    const { role, _id } = res.locals.user;

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

    if (!res.locals.user) return redirectLogin(loginRequiredError);

    const { role } = res.locals.user;

    if (!role) return redirectLogin(unauthorizedError);

    if (undefined !== opts.hasRole.includes(role)) {
      return next();
    }

    logger.debug("Exit middleware::apiIsAuthorized() - authorization error");
    return redirectLogin(authorizationError);
  };
};
