import { Request } from "express";

import fs from "fs";
import env from "../../env";
import JWT from "jsonwebtoken";

const path = require("path");

interface IClientData {
  id: number;
  role: number;
}

class JwtService {
  private secret: string;
  private options: object;

  public static TOKEN_EXPIRED_ERROR = -1;
  public static TOKEN_MISSING_ERROR = -2;
  public static TOKEN_VALIDATION_ERROR = -3;
  public static TOKEN_VALIATION_SUCCESS = 0;

  constructor() {
    //this.secret = process.env.JWT_SECRET || randomString.generate(100);
    // signature data - generate hash that must be identical to the token signature.
    this.options = {
      issuer: env.jwt.issuer,
      expiresIn: env.jwt.access_token_expires,
      algorithm: env.jwt.algorithm,
    };
    //this.options = { expiresIn: cookieProps.options.maxAge.toString() };
    this.secret = fs.readFileSync(
      path.resolve(__dirname, "../.keys/public.key"),
      "utf8"
    );
  }

  private getToken = (hdrs: any) => {
    if (hdrs && hdrs.authorization) {
      let tok = hdrs.authorization.split(" ");
      if (tok.length === 2) {
        return tok[1];
      }
    }
  };

  public authenticate = async (req: Request): Promise<number> => {
    let token = this.getToken(req.headers);
    let status = JwtService.TOKEN_VALIATION_SUCCESS;
    if (!token) {
      status = JwtService.TOKEN_MISSING_ERROR;
    } else {
      // verify jwt access token
      await JWT.verify(token, this.secret, this.options, (err) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            status = JwtService.TOKEN_EXPIRED_ERROR;
          } else {
            status = JwtService.TOKEN_VALIDATION_ERROR;
          }
        } else {
          status = JwtService.TOKEN_VALIATION_SUCCESS;
        }
      });
    }
    return status;
  };
}

export default JwtService;
