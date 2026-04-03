import { tokenEnum } from "../Commeon/Enums/token.Enums.js";
import {
  badRequestExeption,
  unAuthorizedExeption,
} from "../Commeon/Response/Response.js";
import {
  decodeToken,
  getSignature,
  verifyToken,
} from "../Commeon/Security/token.js";
import * as RedisService from "../DB/DB.models/redis.service.js";
// import { TokenModel } from "../DB/DB.models/Token.model.js";
import UserModel from "../DB/DB.models/Users.model.js";
import * as dbRepo from "../DB/DB.Repository.js";

export function authentication(tokenTypeParam = tokenEnum.access) {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    const [BearerKey, token] = authorization.split(" ");
    if (BearerKey != "Bearer") {
      return badRequestExeption("Invalid BearerKey");
    }

    const deCoded = decodeToken({ token: token });
    // const deCoded = jwt.decode(authorization); //extreact from token

    const [userRole, TokenType] = deCoded.aud;

    if (TokenType != tokenTypeParam) {
      return badRequestExeption("invaild token type");
    }
    const { AccessSignature, refreshSignature } = getSignature(userRole);
    // let signiture = "";
    // switch (userRole) {
    //   case User_Roll.User:
    //     signiture = USER_TOKEN_SIGNITURE;
    //     break;
    //   case User_Roll.Admin:
    //     signiture = ADMIN_TOKEN_SIGNITURE;
    //     break;
    // }
    // const varifyToken = jwt.verify(authorization, signiture);
    const varifyToken = verifyToken({
      token: token,
      signature:
        tokenTypeParam == tokenEnum.access ? AccessSignature : refreshSignature,
    });

    // const findToken = await dbRepo.findOne({
    //   model: TokenModel,
    //   filters: { jwti: varifyToken.jti },
    // });

    const findToken = await RedisService.get(
      RedisService.BlackListKeys({
        userID: varifyToken.sub,
        TokenID: varifyToken.jti,
      }),
    );


    if (findToken) {
      return unAuthorizedExeption("you Need to LOgIn aGain ");
    }
    const user = await dbRepo.findById({
      model: UserModel,
      id: varifyToken.sub,
    });

    if (!user) {
      return unAuthorizedExeption("user not found , signUp ");
    }

    if (varifyToken.iat * 1000 < user.ChangeCreditTime) {
      return unAuthorizedExeption("you Need to LOgIn aGain ");
    }
    req.user = user;
    req.payLoad = varifyToken;

    next();

    //   const User = await dbRepo.findById({ model: UserModel, id: userId });
    //   return User;
  };
}
