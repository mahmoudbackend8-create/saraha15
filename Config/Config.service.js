import dotenv from "dotenv";
import path from "path";
export const NODE_ENV = process.env.NODE_ENV;
export const pathEnv = {
  dev: path.resolve("./Config/.env.dev"),
  prod: path.resolve("./Config/.env.prod"),
};
dotenv.config({ path: pathEnv[NODE_ENV || "prod"] });

export const PORT = parseInt(process.env.PORT || 3000);
export const DB_URL_LOCAL = process.env.DB_URL_LOCAL;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND || 10);
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const USER_TOKEN_SIGNITURE = process.env.USER_TOKEN_SIGNITURE;
export const ADMIN_TOKEN_SIGNITURE = process.env.ADMIN_TOKEN_SIGNITURE;
export const GOOGLE_CLIENT_ID = process.env.TOKEN_ID;
export const REFRESH_USER_TOKEN_SIGNITURE =
  process.env.REFRESH_USER_TOKEN_SIGNITURE;
export const REFRESH_ADMIN_TOKEN_SIGNITURE =
  process.env.REFRESH_ADMIN_TOKEN_SIGNITURE;
export const REDIS_URL = process.env.REDIS_URL;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
// $env:NODE_ENV="dev", node --watch ./mainModule.js