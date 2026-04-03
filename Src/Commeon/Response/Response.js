import { NODE_ENV } from "../../../Config/Config.service.js";

export function globalErrHndling(error, req, res, next) {
  return NODE_ENV == "dev"
    ? res
        .status(error.cause?.statusCode || 500)
        .json({ ErrMsg: error.message, error, stack: error.stack })
    : res
        .status(error.cause?.statusCode || 500)
        .json({ ErrMsg: error.message, error, stack: error.stack });
}
export function successResponse({ res, statusCode = 200, data }) {
  return res.status(statusCode).json({ statusCode, MSG: "Success", data });
}

export function badRequestExeption(msg) {
  throw new Error(msg, { cause: { statusCode: 400 } });
}
export function unAuthorizedExeption(msg) {
  throw new Error(msg, { cause: { statusCode: 401 } });
}
export function forbiddenExeption(msg) {
  throw new Error(msg, { cause: { statusCode: 403 } });
}
export function notFoundExeption(msg) {
  throw new Error(msg, { cause: { statusCode: 404 } });
}
export function conflictExeption(msg) {
  throw new Error(msg, { cause: { statusCode: 409 } });
}
