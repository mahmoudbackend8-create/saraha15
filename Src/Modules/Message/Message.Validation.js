import joi from "joi";
import { CommonFieldValidation } from "../../MiddleWare/validation.MiddleWare.js";
export const SendMessageSchema = {
  body: joi.object({}).keys({
    Contact: joi.string().min(3).max(1000),
  }),
  params: joi
    .object({})
    .keys({
      ReceiverID: CommonFieldValidation.id.required(),
    })
    .required(),
};
export const GetMSGById = {
  params: joi
    .object({})
    .keys({ MessageId: CommonFieldValidation.id.required() })
    .required(),
};
