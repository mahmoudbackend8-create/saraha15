import UserModel from "../../DB/DB.models/Users.model.js";
import jwt from "jsonwebtoken";
import * as dbRepo from "../../DB/DB.Repository.js";
import {
  ADMIN_TOKEN_SIGNITURE,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
import {
  badRequestExeption,
  unAuthorizedExeption,
} from "../../Commeon/Response/Response.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import {
  decodeToken,
  generateToken,
  getSignature,
  verifyToken,
} from "../../Commeon/Security/token.js";
import { decreyption } from "../../Commeon/Security/encrypt.js";
// import { TokenModel } from "../../DB/DB.models/Token.model.js";
import * as RedisService from "../../DB/DB.models/redis.service.js";
import { comparing, hashing } from "../../Commeon/Security/hash.js";

//decoded
//get user data
//get user role
//check token type - must be refresh
//return new access token
export async function renewToken(UserData) {
  // const { authorization } = headersData;
  // // const decodedToken = jwt.decode(authorization);
  //   const decodedToken =decodeToken({token:authorization})

  // const [userRole, TokenType] = decodedToken.aud;

  // if (TokenType != tokenEnum.refresh) {
  //   return badRequestExeption("invalid refresh token ");
  // }

  // const { refreshSignature, AccessSignature } = getSignature(userRole);

  // // const verifiedToken = jwt.verify(authorization, refreshSignature);

  // const verifiedToken =verifyToken({token:authorization,signature:refreshSignature})

  const { AccessSignature } = getSignature(UserData.Roll);
  const newAccessToken = generateToken({
    signature: AccessSignature,
    options: {
      noTimestamp: true,
      expiresIn: 60 * 15,
      notBefore: 1,
      audience: [UserData.Roll, tokenEnum.access],
      subject: UserData._id.toString(),
    },
  });

  return newAccessToken;
}

export async function uploadProfilePic(userId, file) {
  const result = await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: { ProfilePic: file.finalPath }, //ProfilePic same name in USERMODEL
  });
}

export async function coverProfilePic(userId, files) {
  const filePicsPath = files.map((file) => {
    return file.finalPath;
  });

  //or

  // const filePicsPath=[]
  // for(const file of files){
  //   filePicsPath.push(file.finalPath)
  // }

  const result = await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: { coverFilePic: filePicsPath }, //ProfilePic same name in USERMODEL
  });
}

export async function getAnotherProfile(profileId) {
  const user = await dbRepo.findById({
    model: UserModel,
    id: profileId,
    selelct:
      "-Password -Roll -confirmEmail -Providor -createdAt -updatedAt -__v",
  });

  if (user.phone) {
    user.phone = decreyption({ ciphertext: user.phone });
  }

  return user;
}

export async function logOut(userId, TokenData, LogOutOption) {
  if (LogOutOption == "all") {
    await dbRepo.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: { ChangeCreditTime: new Date() },
    });
  } else {
    await RedisService.set({
      key: RedisService.BlackListKeys({
        userID: TokenData.sub,
        TokenID: TokenData.jti,
      }),
      value: TokenData.jti,
      EXvalue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - TokenData.iat), //(exRefreshToken -ramain time from initiated)
    });
  }
}

/*
old way
export async function logOut(userId, TokenData, LogOutOption) {
  if (LogOutOption == "all") {
    await dbRepo.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: { ChangeCreditTime: new Date() },
    });
  } else {
    const Token = await dbRepo.Create({
      model: TokenModel,
      data: {
        jwti: TokenData.jti,
        userId,
        expiredIn: (TokenData.iat + 60 * 60 * 24 * 365) * 1000, // data base dealing with meleSceond - token with Seconds
      },
    });
    return Token;
  }
}

*/

export async function updatePassword(bodyData, UserData) {
  const { oldPassword, NewPassword } = bodyData;
  const { Password } = UserData;
  const OldpasswordMatched = await comparing({
    plainValue: oldPassword,
    hashValue: Password,
  });
  if (!OldpasswordMatched) {
    return badRequestExeption("invalid OldPassword");
  }
  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: UserData._id },
    data: {
      Password: await hashing({ PlainText: NewPassword }),
      ChangeCreditTime: new Date(),
    },
  });
}
