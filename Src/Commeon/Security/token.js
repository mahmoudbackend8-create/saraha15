import {
  ADMIN_TOKEN_SIGNITURE,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { tokenEnum } from "../Enums/token.Enums.js";
import { User_Roll } from "../Enums/User.Enums.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
export function getSignature(role) {
  let refreshSignature = "";
  let AccessSignature = "";
  switch (role) {
    case User_Roll.User:
      refreshSignature = REFRESH_USER_TOKEN_SIGNITURE;
      AccessSignature = USER_TOKEN_SIGNITURE;
      break;

    case User_Roll.Admin:
      refreshSignature = REFRESH_ADMIN_TOKEN_SIGNITURE;
      AccessSignature = ADMIN_TOKEN_SIGNITURE;
      break;
  }
  return { refreshSignature, AccessSignature };
}
export function generateToken({ payload = {}, signature, options = {} }) {
  return jwt.sign(payload, signature, options);
}
export function verifyToken({ token, signature }) {
  return jwt.verify(token, signature);
}
export function decodeToken({ token }) {
  return jwt.decode(token);
}

export function generateAccessAndRefreshToken(user) {
  const { AccessSignature, refreshSignature } = getSignature(user.Roll);
  const TokenId = randomUUID();
  const Access_Token = generateToken({
    signature: AccessSignature,
    options: {
      noTimestamp: false,
      expiresIn: 60 * 15,
      notBefore: 1,
      jwtid: TokenId,
      audience: [user.Roll, tokenEnum.access], //we  put tokenEnum.access to return it.s type
      subject: user._id.toString(),
    },
  });

  const Refresh_Token = generateToken({
    signature: refreshSignature,
    options: {
  
      noTimestamp: false,
      expiresIn: "1y",
      notBefore: 1,
      jwtid: TokenId,
      audience: [user.Roll, tokenEnum.refresh],
      subject: user._id.toString(),
    },
  });

  return { Access_Token, Refresh_Token };
}
