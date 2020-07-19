import crypto from "crypto";
import { Schema } from "mongoose";

import DbClient from "../dbs/DbClient";
import env from "../../env";

export enum UserRoles {
  User = "User",
  Technician = "Technician",
  Supervisor = "Supervisor",
  Manager = "Manager",
  Admin = "Admin",
}

const SchemaDefinitions = {
  fullName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  verificationCode: { type: String },
  verifiedAt: { type: Date },
  active: { type: Boolean },
};

const SchemaOptions = {
  timestamps: true,
};

const schema = new Schema(SchemaDefinitions, SchemaOptions);

schema.methods.validatePassword = function (password: string): any {
  let _password = crypto
    .pbkdf2Sync(password, env.salt, 10000, 32, "sha512")
    .toString("hex");
  return this.password === _password;
};

schema.methods.setPassword = function (password: string) {
  this.password = crypto
    .pbkdf2Sync(password, env.salt, 10000, 32, "sha512")
    .toString("hex");
};

export const UserModel = () => {
  const client = new DbClient(env.mongoDb["taskpal"].name);
  return client.getModel("User", "users", schema);
};
