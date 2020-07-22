import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

import { UserInfo, UserModel, UserRoles } from "@models/User";
import logger from "@shared/Logger";
import { cookieProps } from "@shared/constants";
const crypto = require("crypto");

/************************************************************************************
 *                             Admin UI Midleware
 ***********************************************************************************/

/**
 *
 * @param req
 * @param res
 */
export const renderSignIn = (req: Request, res: Response) => {
  req!.session!.destroy((err) => {
    if (err)
      logger.warn(
        "AuthController::renderSignIn() - destroy previous session failed: " +
          err
      );
  });
  res.render("sign-in");
};

/**
 *
 * @param req
 * @param res
 */
export const doSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Enter controller::doSignIn()");
  let error: string = "";
  if (
    !req.body.username ||
    !req.body.username.length ||
    !req.body.password ||
    !req.body.password.length
  ) {
    error = "Invalid username or password";
  } else {
    let user = await UserModel.findOne({ email: req.body.username });
    if (!user || !user.active) {
      error = "User not found";
    } else if (false === UserRoles.includes(user.role)) {
      error = "Unauthorized user!";
    } else {
      if (user.validatePassword(req.body.password)) {
        req!.session!.user = {
          _id: user._id,
          fullName: user.fullName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        };
        res.redirect("/");
      }
    }
  }

  if (error.length) {
    res.render("sign-in", { error: error });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const doSignOut = (req: Request, res: Response) => {
  req!.session!.destroy((err) => {
    if (!err) {
      logger.info("Logout success!!");
    } else {
      logger.warn("Logout failed.");
    }
    const { key, options } = cookieProps;
    res.clearCookie(key, options);
  });
  res.redirect("/");
};

export const renderRegistration = (req: Request, res: Response) => {
  logger.debug("Enter controller::renderRegistration()");
  res.render("register", renderRegistrationFormErrors(req));
};

/**
 * Execute user registration: validate input fields, return error fields.
 * Otherwise, save to DB and respond with success
 *
 * @param req
 * @param res
 */
export const doRegister = async (req: Request, res: Response) => {
  logger.debug("Enter controller::doRegister()");

  // check validation result, if error send back error message

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req!.session!.form = getRegistrationFormErrors(req.body, errors.array());
    const message = "Validation failed! Check form fields for errors.";
    req.flash("error", message);
    logger.warn(message);
    return res.redirect("/register");
  }

  // check if clientId is required when requester is SuperAdmin

  let { role, clientId } = req.body;

  if ("SuperAdmin" === req!.session!.user.role && !clientId) {
    req.flash("error", "clientId is required");
    return res.redirect("/register");
  } else {
    // get clientId associated with this merchant
    clientId = req!.session!.user.clientId;
  }

  // Create User

  let _user = new UserModel({
    fullName: req.body.fullName,
    email: req.body.email,
    role: role,
    active: true,
    clientId: clientId,
    verificationCode: crypto.randomBytes(16).toString("hex"),
  });
  _user.setPassword(req.body.password);
  let user = null;
  try {
    user = await _user.save();
  } catch (err) {
    res.redirect(req.url, err);
  }

  if (!user) {
    const error = "Server error. Can not create user";
    res.render("register", { error: error });
  }

  return res.render("register", { signup: { success: true } });
};

/************************************************************************************
 *                              Helper methods/utils
 ***********************************************************************************/

interface IUserRegistrationForm {
  email: any;
  fullName: any;
  password: any;
  role: any;
  clientId: any;
}

interface IUserRegistrationPage extends IUserRegistrationForm {
  location: String;
  message: String;
  error: String;
  loggedInUser: UserInfo;
}

export const registrationFormValidation = [
  // validate
  body("fullName", "Full name is required").notEmpty(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        return Promise.reject("Email account in use");
      }
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be 8 chars or more"),
  body("role", "User role is required").notEmpty(),
];

/**
 * Retrieve form field objects generated after a registration validation error.
 * The validation field objects are created by getRegistrationErrors
 * These values will be sent back to registration form page.
 *
 * @param req
 */
const renderRegistrationFormErrors = (req: Request) => {
  logger.debug("Enter renderRegistrationFormErrors()");
  let params: IUserRegistrationPage = {} as IUserRegistrationPage;
  params.location = "sign-up";
  params.loggedInUser = req!.session!.user;

  const form = req!.session!.form;
  if (form) {
    params.fullName = form.fullName;
    params.email = form.email;
    params.password = form.password;
    params.role = form.role;
    params.clientId = form.clientid;
    params.error = req.flash("error");
  } else {
    params.message = req.flash("message");
  }

  logger.debug(JSON.stringify(params));
  // remove cached form of prior submission
  delete req!.session!.form;

  return params;
};

/**
 * generate registration form fields with corresponding validation error messages if any
 *
 * @param frmElements
 * @param errors
 */
const getRegistrationFormErrors = (frmElements: any, errors: any) => {
  logger.debug("Enter getRegistrationFormErrors()");

  let userForm: IUserRegistrationForm = {} as IUserRegistrationForm;
  logger.debug(JSON.stringify(frmElements));

  const { fullName, email, password, role, clientId } = frmElements;

  userForm.fullName = getFieldValidationResult("fullName", fullName, errors);
  userForm.email = getFieldValidationResult("email", email, errors);
  userForm.password = getFieldValidationResult("password", password, errors);
  userForm.role = getFieldValidationResult("role", role, errors);
  userForm.clientId = getFieldValidationResult("clientId", role, errors);

  logger.debug(JSON.stringify(userForm));

  return userForm;
};

const createValidationResult = (
  errors: Array<any>,
  fieldName: String,
  fldInfo: any
) => {
  for (let err of errors) {
    if (err.param === fieldName) {
      fldInfo.msg += fldInfo.msg.length > 0 ? ", " + err.msg : err.msg;
      fldInfo.error = true;
    }
  }
  return fldInfo;
};

const getFieldValidationResult = (
  fldName: String,
  fldVal: string,
  errors: Array<any>
) => {
  return createValidationResult(errors, fldName, {
    value: fldVal,
    error: false,
    msg: "",
  });
};
