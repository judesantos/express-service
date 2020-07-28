import { Request, Response } from "express";
import {
  BAD_REQUEST,
  OK,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} from "http-status-codes";
import {
  paramMissingError,
  loginFailedErr,
  cookieProps,
  loginInvalidUsernamePass,
  loginMissingUserPassErr,
  unauthorizedError,
} from "@shared/constants";

import { UserRoles, UserModel } from "@models/User";
import logger from "@shared/Logger";

export const doLogin = async (username: string, password: string) => {
  // Check email and password present
  if (!username || !password) {
    return {
      status: BAD_REQUEST,
      message: loginMissingUserPassErr,
    };
  }
  // Fetch user
  const user = await UserModel.findOne({ email: username });

  if (!user || !user.active || false === UserRoles.includes(user.role)) {
    return {
      status: UNAUTHORIZED,
      message: loginFailedErr,
    };
  } else if (user.validatePassword(password)) {
    if (!UserRoles.includes(user.role)) {
      return {
        status: FORBIDDEN,
        message: unauthorizedError,
      };
    }
    return {
      status: OK,
      data: user,
    };
  } else {
    return {
      status: UNAUTHORIZED,
      message: loginInvalidUsernamePass,
    };
  }
};

export const login = async (req: Request, res: Response) => {
  logger.debug("Enter Auth::login()");
  logger.debug("args: " + JSON.stringify(req.body));

  const { username, password } = req.body;

  const ret = await doLogin(username, password);

  if (OK === ret.status) {
    const user = ret.data;
    req!.session!.user = {
      _id: user._id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      active: user.role,
      token: req.headers.authorization,
    };
    res.locals.authorized = true;
    return res.status(OK).json("Login success!");
  } else {
    return res.status(ret.status).json(ret.message);
  }
};

export const logout = async (req: Request, res: Response) => {
  const { key, options } = cookieProps;
  res.clearCookie(key, options);
  req!.session!.destroy((err) => {
    if (err) {
      return res.status(INTERNAL_SERVER_ERROR).end();
    }

    return res.status(OK).end();
  });
};
