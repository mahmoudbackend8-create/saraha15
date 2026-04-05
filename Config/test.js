import Joi from "joi";
import { badRequestExeption } from "../Src/Commeon/Response/Response";
export const CommonFeildsValidation = {
  userName: Joi.string().pattern(
    new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
  ),
};

const signUpSchema = Joi.object({}).keys({
  userName: CommonFeildsValidation.userName.required(),
});

export function validation(schema) {
  return (req, res, next) => {
    const validationErr = [];
    for (const schemaKey of Object.keys(schema)) {
      const ValidationResult = schema[schemaKey].validate(req[schemaKey]);
      if (ValidationResult.error?.details.length > 0) {
        validationErr.push(ValidationResult.error);
      }
    }
    if (validationErr.length > 0) {
      throw badRequestExeption(validationErr);
    }
    next();
  };
}
