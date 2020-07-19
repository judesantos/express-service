import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import { UserRoles } from "@models/User";

export const isAuthorized = (opts: {
  hasRole: UserRoles;
  allowSameUser?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role, uid } = res.locals;
    const { id } = req.params;

    if (opts.allowSameUser && id && uid === id) {
      return next();
    }

    if (!role) {
      return res.status(FORBIDDEN).send("unauthorized user role");
    }

    if (opts.hasRole.includes(role)) {
      return next();
    }

    return res.status(FORBIDDEN).send("unauthorized user");
  };
};
