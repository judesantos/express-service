import { Request, Response, Router } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { ParamsDictionary } from "express-serve-static-core";

import { paramMissingError } from "@shared/constants";
import { UserRoles, UserModel } from "@models/User";

// Init shared
const router = Router();
const userModel = UserModel();

export const find = async (req: Request, res: Response) => {
  const users = await userModel.find();
  return res.status(OK).json({ users });
};

export const create = async (req: Request, res: Response) => {
  // Check parameters
  const { user } = req.body;
  if (!user) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }
  // Add new user
  user.role = UserRoles.User;
  await user.create(user);
  return res.status(CREATED).end();
};

export const update = async (req: Request, res: Response) => {
  // Check Parameters
  const { user } = req.body;
  if (!user) {
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    });
  }
  // Update user
  user.id = Number(user.id);
  await userModel.update(user);
  return res.status(OK).end();
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params as ParamsDictionary;
  await userModel.remove(Number(id));
  return res.status(OK).end();
};
