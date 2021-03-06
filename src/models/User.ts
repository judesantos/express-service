import crypto from "crypto";
import { Schema } from "mongoose";

import DbContext from "../dbs/DbContext";
import logger from "@lib/Logger";
import env from "../../.env";

export interface UserInfo {
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  clientId: string;
}

export const UserRoles = [
  "SuperAdmin",
  "Admin",
  "Manager",
  "Supervisor",
  "Manager",
  "Technician",
  "User",
];

const UserSchema = new Schema(
  {
    fullName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String },
    verificationCode: { type: String },
    verifiedAt: { type: Date },
    active: { type: Boolean },
    clientId: { type: String },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.validatePassword = function (password: string) {
  logger.debug("Enter UserSchema::validatePassword()");
  let _password = crypto
    .pbkdf2Sync(password, env.salt, 10000, 32, "sha512")
    .toString("hex");
  const isMatched = this.password === _password;
  logger.debug("Exit UserSchema::validatePassword() - isMatched: " + isMatched);
  logger.debug(
    JSON.stringify({
      password: this.password,
      _password,
      salt: env.salt,
    })
  );
  return isMatched;
};

UserSchema.methods.setPassword = function (password: string) {
  this.password = crypto
    .pbkdf2Sync(password, env.salt, 10000, 32, "sha512")
    .toString("hex");
};

const dbCtx = DbContext.getInstance();
const taskpalDb = dbCtx.useDb(env.mongoDb["taskpal"].name);

export const UserModel = taskpalDb.model("User", UserSchema, "users");
