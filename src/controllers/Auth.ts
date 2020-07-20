import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { BAD_REQUEST, OK, UNAUTHORIZED, NOT_FOUND } from "http-status-codes";
import {
  paramMissingError,
  loginFailedErr,
  cookieProps,
} from "@shared/constants";

import { UserRoles, UserModel } from "@models/User";
import logger from "@shared/Logger";

/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

export const login = async (req: Request, res: Response) => {
  logger.debug("Enter Auth::login()");
  // Check email and password present
  const { email, password } = req.body;
  if (!(email && password)) {
    logger.debug("Auth::login() - bad request");
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }
  // Fetch user
  const user = await UserModel.findOne({ email: email });
  logger.debug(user);
  if (!user || !user.active || !(user.role in UserRoles)) {
    return res.status(UNAUTHORIZED).json({
      error: loginFailedErr,
    });
  } else if (user.validatePassword(password)) {
    req!.session!.user = {
      _id: user._id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      active: user.role,
    };
    return res.status(OK).json("Login success!");
  } else {
    return res.status(UNAUTHORIZED).json({
      error: loginFailedErr,
    });
  }
};

/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

export const logout = async (req: Request, res: Response) => {
  const { key, options } = cookieProps;
  res.clearCookie(key, options);
  return res.status(OK).end();
};
