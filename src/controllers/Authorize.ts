import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import { UserRoles } from "@models/User";
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

    if (opts.hasRole.includes(role)) {
      return next();
    }

    return res.status(FORBIDDEN).send("Unauthorized user!");
  };
};

/**
 *
 * @param opts
 */
export const isApiUserAuthorized = (opts: {
  hasRole: Array<
    "SuperAdmin" | "Admin" | "Manager" | "Supervisor" | "Technician" | "User"
  >;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Entering middleware::isApiUserAuthorized()");
    const redirectLogin = () =>
      res.status(FORBIDDEN).send("Unauthorized access to resource");

    if (!req!.session!.user) return redirectLogin();

    const { role, _id } = req!.session!.user;

    if (!_id || !role) return redirectLogin();

    if (opts.hasRole.includes(role)) {
      return next();
    }

    return res.status(FORBIDDEN).send("Unauthorized user!");
  };
};
