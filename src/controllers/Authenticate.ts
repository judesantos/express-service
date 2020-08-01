import { Request, Response, NextFunction } from "express";
import { OK, UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import {
  authenticationError,
  invalidAuthError,
  invalidAuthFormatError,
  tokenInvalidError,
  tokenMisingError,
  tokenExpiredError,
  loginRequiredError,
} from "@shared/constants";

import JwtService from "@shared/JwtService";
import logger from "@shared/Logger";
import { ResponseData } from "@shared/Types";

const jwtService = new JwtService();

const isAuthenticated = async (req: Request, res: Response) => {
  logger.debug("Entering middleware::isAuthenticated()");

  const { authorization } = req.headers;

  if (!authorization) {
    return {
      status: FORBIDDEN,
      message: authenticationError,
    } as ResponseData;
  }

  if (!authorization.startsWith("Bearer")) {
    return {
      status: FORBIDDEN,
      message: invalidAuthError,
    } as ResponseData;
  }

  const split = authorization.split("Bearer ");

  if (split.length !== 2) {
    return {
      status: FORBIDDEN,
      message: invalidAuthFormatError,
    } as ResponseData;
  }

  const jwtRet: any = await jwtService.authenticate(authorization);

  if (jwtRet.status == JwtService.TOKEN_EXPIRED_ERROR) {
    return {
      status: UNAUTHORIZED,
      message: tokenExpiredError,
    } as ResponseData;
  } else if (jwtRet.status == JwtService.TOKEN_MISSING_ERROR) {
    return {
      status: FORBIDDEN,
      message: tokenMisingError,
    } as ResponseData;
  } else if (jwtRet.status == JwtService.TOKEN_VALIDATION_ERROR) {
    return {
      status: FORBIDDEN,
      message: tokenInvalidError,
    } as ResponseData;
  }

  return {
    status: OK,
    data: jwtRet,
  } as ResponseData;
};

export const adminIsAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Entering middleware::adminIsAuthenticated()");

  const ret: any = isAuthenticated(req, res);

  if (OK !== ret.status) {
    return res.status(ret.status).send(ret.message);
  }

  next();
};

export const apiIsAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Enter middleware::apiIsAuthenticated()");

  const ret: any = await isAuthenticated(req, res);

  if (OK !== ret.status) {
    return res.status(ret.status).json(ret.message);
  }

  res.locals.user = ret.data;

  logger.debug("Exit middleware::apiIsAuthenticated()");
  next();
};
