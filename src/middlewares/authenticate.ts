import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import { UserRoles } from "@models/User";
import logger from "@shared/Logger";

export const isAuthenticated = (opts: {
  hasRole: number;
  allowSameUser?: boolean;
}) => {
  logger.debug("Entering middleware::isAuthenticated()");
  return (req: Request, res: Response, next: NextFunction) => {
    const { role, uid } = res.locals;
    const { id } = req.params;

    if (opts.allowSameUser && id && uid === id) {
      return next();
    }

    if (!role) {
      return res.status(FORBIDDEN).send("unauthorized user role");
    }

    if (opts.hasRole in UserRoles) {
      return next();
    }

    return res.status(FORBIDDEN).send("unauthorized user");
  };
};
