import { Request, Response, NextFunction } from "express";
import { UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import JwtService from "@shared/JwtService";
import logger from "@shared/Logger";
const jwtService = new JwtService();

export const isAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Entering middleware::isAuthorized()");
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(FORBIDDEN)
      .send("Authentication failed: missing authorization in request");
  }

  if (!authorization.startsWith("Bearer")) {
    return res
      .status(FORBIDDEN)
      .send("Authentication failed: invalid authorization");
  }

  const split = authorization.split("Bearer ");

  if (split.length !== 2) {
    res
      .status(FORBIDDEN)
      .send("Authentication failed: invalid authorization format.");
  }

  const status = await jwtService.authenticate(req);

  if (status == JwtService.TOKEN_EXPIRED_ERROR) {
    return res.status(UNAUTHORIZED).send("TokenExpired");
  } else if (status == JwtService.TOKEN_MISSING_ERROR) {
    return res.status(FORBIDDEN).send("MissingToken");
  } else if (status == JwtService.TOKEN_VALIDATION_ERROR) {
    return res.status(FORBIDDEN).send("InvalidToken");
  }

  return next();
};
