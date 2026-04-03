import joi from "joi";
import { badRequestExeption } from "../Commeon/Response/Response.js";
import {
  User_Gender,
  User_Providor,
  User_Roll,
} from "../Commeon/Enums/User.Enums.js";
import { Types } from "mongoose";

export function validation(schema) {
  return (req, res, next) => {
    const validationErr = [];
    for (const schemaKey of Object.keys(schema)) {
      const validationResult = schema[schemaKey].validate(req[schemaKey], {
        abortEarly: false,
      });
      // req[schemaKey] = validationResult.value;

      if (validationResult.error?.details.length > 0) {
        validationErr.push(validationResult.error);
      }
    }
    if (validationErr.length > 0) {
      throw badRequestExeption(validationErr);
    }
    next();
  };
}

export const CommonFieldValidation = {
  UserName: joi
    .string()
    .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/)),
  email: joi.string(),
  Password: joi.string(),
  DOB: joi.date(),
  phone: joi.string(),
  gender: joi.string().valid(...Object.values(User_Gender)),
  Roll: joi.string().valid(...Object.values(User_Roll)),
  confirmEmail: joi.boolean(),
  Providor: joi.string().valid(...Object.values(User_Providor)),
  OTP: joi.string().pattern(new RegExp(/\d{6}/)),
  id: joi.string().custom(validateObjectId),
};

export function validateObjectId(value, helpers) {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("invalid ObjectId");
  }
}
