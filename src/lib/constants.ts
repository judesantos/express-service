// Strings
export const paramMissingError = "Missing required arguments.";
export const invalidArgumentError = "Invalid argument";
export const loginMissingUserPassErr = "Missing username or password";
export const loginFailedErr = "Login failed";
export const loginPasswordError = "Password validation failed";
export const loginInvalidUsernamePass = "Invalid username or password";

export const unauthorizedError = "User unauthorized to access this resource";
export const authorizationError = "Can not verify user authorization";
export const loginRequiredError = "Login required to access resource";
export const authenticationError = "Missing authorization in request";
export const invalidAuthError = "Invalid authorization";
export const invalidAuthFormatError = "Invalid authorization format.";

export const tokenExpiredError = "TokenExpired";
export const tokenMisingError = "TokenMissing";
export const tokenInvalidError = "TokenInvalid";

export const serverError = "Server error";

// Numbers
export const pwdSaltRounds = 12;

// Cookie Properties
export const cookieProps = Object.freeze({
  key: "ExpressGeneratorTs",
  secret: process.env.COOKIE_SECRET,
  options: {
    httpOnly: true,
    signed: true,
    path: process.env.COOKIE_PATH,
    maxAge: Number(process.env.COOKIE_EXP),
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.SECURE_COOKIE === "true",
  },
});
