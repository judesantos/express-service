import fs from "fs";
import env from "../../.env";
import JWT from "jsonwebtoken";
import logger from "@lib/Logger";
import { ResponseData } from "./Types";

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
  public static TOKEN_VALIDATION_SUCCESS = 0;

  constructor() {
    logger.debug("Enter JwtService::constructor()");
    // signature data - generate hash that must be identical to the token signature.
    this.options = {
      issuer: env.jwt.issuer,
      expiresIn: env.jwt.access_token_expires,
      algorithm: env.jwt.algorithm,
    };
    this.secret = fs.readFileSync(
      path.resolve(__dirname, "../../.keys/public.key"),
      "utf8"
    );
  }

  private getToken = (auth: string) => {
    if (auth) {
      let tok = auth.split(" ");
      if (tok.length === 2) {
        return tok[1];
      }
    }
  };

  public authenticate = async (
    auth: string
  ): Promise<ResponseData | number> => {
    logger.debug("Enter JwtService::authenticate()");

    let error = "";
    let status = JwtService.TOKEN_VALIDATION_SUCCESS;
    let _decoded: any = null;

    let token = this.getToken(auth);

    if (!token) {
      status = JwtService.TOKEN_MISSING_ERROR;
    } else {
      // verify jwt access token
      await JWT.verify(token, this.secret, this.options, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            status = JwtService.TOKEN_EXPIRED_ERROR;
          } else {
            status = JwtService.TOKEN_VALIDATION_ERROR;
            error = err.message;
          }
        } else {
          _decoded = decoded;
          logger.debug(JSON.stringify({ decodedTokenData: decoded }));
          status = JwtService.TOKEN_VALIDATION_SUCCESS;
        }
      });
    }

    return {
      status: status,
      message: error,
      data: _decoded as JwtTokenData,
    } as ResponseData;
  };
}

export interface JwtTokenData {
  status: number;
  clientId: string;
  iss: string;
  userId: string;
  exp: string;
  email: string;
}

export default JwtService;
