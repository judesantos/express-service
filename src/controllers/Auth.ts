import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { BAD_REQUEST, OK, UNAUTHORIZED } from "http-status-codes";
import {
  paramMissingError,
  loginFailedErr,
  cookieProps,
} from "@shared/constants";

import { UserModel } from "@models/User";

const userModel = UserModel();

/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

export const login = async (req: Request, res: Response) => {
  // Check email and password present
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }
  // Fetch user
  const user = await userModel.findOne(email);
  if (!user) {
    return res.status(UNAUTHORIZED).json({
      error: loginFailedErr,
    });
  }
  // Check password
  const pwdPassed = await bcrypt.compare(password, user.pwdHash);
  if (!pwdPassed) {
    return res.status(UNAUTHORIZED).json({
      error: loginFailedErr,
    });
  }
  // Return
  return res.status(OK).end();
};

/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

export const logout = async (req: Request, res: Response) => {
  const { key, options } = cookieProps;
  res.clearCookie(key, options);
  return res.status(OK).end();
};
