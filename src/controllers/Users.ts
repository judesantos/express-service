import { Request, Response, Router } from "express";
import { BAD_REQUEST, CREATED, OK, NOT_ACCEPTABLE } from "http-status-codes";
import { ParamsDictionary } from "express-serve-static-core";

import { paramMissingError, invalidArgumentError } from "@lib/constants";
import { UserModel } from "@models/User";
import logger from "@lib/Logger";

// Init shared
const router = Router();

export const findOne = async (req: Request, res: Response) => {
  logger.debug("Enter User.findOne()");
  logger.debug("req: " + JSON.stringify(req.query));

  const { id, email, fullName } = req.query;
  let params = [];

  let clientId = res.locals.user.clientId;
  // restrict search to users of the same clientId.
  // If user is 'SuperAdmin', clientId may be wildcarded
  clientId = clientId === 0 ? "/.*" + clientId + ".*/" : clientId;

  if (id) params.push({ _id: id });
  if (clientId) params.push({ clientId: clientId });
  if (email) params.push({ email: /.*`${email}`.*/ });
  if (fullName) params.push({ fullName: /.*`${fullName}`.*/ });

  const query = { $or: params };
  logger.debug("Users.find(" + JSON.stringify(query) + ")");

  const user = await UserModel.findOne(query);

  return res.status(OK).json(user);
};

export const findAll = async (req: Request, res: Response) => {
  logger.debug("Enter User.findAll()");
  req.query.all = "true";
  return find(req, res);
};

/**
 * Find multiple users by either of the following user properties:
 *  id, email, clientId, fullName
 *
 * Pagination:
 *  - Input argument requires number of rows('limit'), and row offset('offset').
 *  - Return 100 rows if limit is not specified in argument.
 *  - Return rows starting at offset 0 (first row) if offset is not specified in argument.
 *
 * @param req
 * @param res
 */
export const find = async (req: Request, res: Response) => {
  logger.debug("Enter User.find()");

  let params = [];
  let offset: number = Number(req.query.offset as string);
  let limit: number = Number(req.query.limit as string);

  const email: string | null = req.query.email as string;
  const fullName: string | null = req.query.fullName as string;
  const id: string = req.query.id as string;
  const all: boolean = req.query.all
    ? req.query.all === "true"
      ? true
      : false
    : false;

  // args email, fullname are always wildcarded.
  if (id) params.push({ _id: id });
  if (email) params.push({ email: new RegExp(email, "i") });
  if (fullName) params.push({ fullName: new RegExp(fullName, "i") });
  // Fail if query param missing either id, email, fullname.
  // Allow if all is set - from findAll
  if (!params.length && !all) {
    return res.status(OK).json(paramMissingError);
  }
  // restrict search to users of the same clientId.
  // If user is 'SuperAdmin', clientId may be wildcarded
  let clientId = res.locals.user.clientId;
  clientId = clientId === 0 ? new RegExp(clientId, "i") : clientId;
  if (clientId) params.push({ clientId: clientId });
  // paginate if available, if not set defaults
  if (!offset) offset = 0;
  if (!limit) limit = 100;

  let users: any = [];
  const query = { $and: params };

  try {
    // execute query
    users = await UserModel.find(query).skip(offset).limit(limit);
  } catch (e) {
    logger.warn("Users.find() exception: " + JSON.stringify(e));
    return res.status(NOT_ACCEPTABLE).json(invalidArgumentError);
  }

  return res.status(OK).json(users);
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
  await UserModel.create(user);
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
  user.id = Number(user._id);
  await UserModel.update(user);
  return res.status(OK).end();
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params as ParamsDictionary;
  await UserModel.delete(Number(id));
  return res.status(OK).end();
};
