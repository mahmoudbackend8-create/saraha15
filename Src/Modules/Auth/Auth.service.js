import { compare, hash } from "bcrypt";
import {
  badRequestExeption,
  conflictExeption,
  notFoundExeption,
} from "../../Commeon/Response/Response.js";
import UserModel from "../../DB/DB.models/Users.model.js";
import * as dbRepo from "../../DB/DB.Repository.js";
import * as RediesMethod from "../../DB/DB.models/redis.service.js";
import {
  ADMIN_TOKEN_SIGNITURE,
  ENCRYPTION_KEY,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  SALT_ROUND,
  GOOGLE_CLIENT_ID,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { comparing, hashing } from "../../Commeon/Security/hash.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { User_Providor, User_Roll } from "../../Commeon/Enums/User.Enums.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import {
  generateAccessAndRefreshToken,
  generateToken,
  getSignature,
} from "../../Commeon/Security/token.js";
import { OAuth2Client } from "google-auth-library";
import { generateOTP } from "../../Commeon/OTP/OTP.Service.js";
import sendMail from "../../Commeon/email/email.Config.js";
import { EmailTypeEnums } from "../../Commeon/Enums/email.Enums.js";
// import { html } from "../../Commeon/email/email.html.js";
///////////////////////////////////////////////////////////////////////////////////////////////

async function SendEmailOTP({ email, emailType, subject }) {
  const previousOTPTTL = await RediesMethod.ttl(
    RediesMethod.getOTPKey({ email, emailType }),
  );
  if (previousOTPTTL > 0) {
    return badRequestExeption(
      `you have valid otp - wait ${previousOTPTTL} second `,
    );
  }

  const ReqBlocked = await RediesMethod.ttl(
    RediesMethod.getOTPKeyBlocked({
      email,
      emailType,
    }),
  );
  if (ReqBlocked > 0) {
    return badRequestExeption(`you cant send OTP Remain Time ${ReqBlocked}M`);
  }
  const reqNum = await RediesMethod.get(
    RediesMethod.getOTPKeyAtempsNum({
      email,
      emailType,
    }),
  );
  if (reqNum == 5) {
    await RediesMethod.set({
      key: RediesMethod.getOTPKeyBlocked({
        email,
        emailType,
      }),
      value: 1,
      EXvalue: 5 * 60,
    });
    return badRequestExeption(
      `you can.t request more than 4 OTP in 20 Minutes `,
    );
  }
  const OTP = generateOTP();
  await sendMail({
    to: email,
    subject,
    html: `<h1>${OTP}</h1>`,
  });
  await RediesMethod.set({
    key: RediesMethod.getOTPKey({
      email,
      emailType,
    }),
    value: await hashing({ PlainText: OTP }),
    EXvalue: 120,
  });

  await RediesMethod.incr(
    RediesMethod.getOTPKeyAtempsNum({
      email,
      emailType,
    }),
  );
}

export async function signUp(bodyData) {
  const { email } = bodyData;
  const CheckEmail = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  if (CheckEmail) {
    return conflictExeption("Email Already Exist");
  }
  const hashPassword = await hashing({
    PlainText: bodyData.Password,
  });
  bodyData.Password = hashPassword;

  if (bodyData.phone) {
    const phoneCrypted = CryptoJS.AES.encrypt(
      bodyData.phone,
      ENCRYPTION_KEY,
    ).toString();
    bodyData.phone = phoneCrypted;
  }

  const User = await dbRepo.Create({ model: UserModel, data: bodyData });

  const OTP = generateOTP();

  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.confirmEmail,
    subject: "Confirm Your Email",
  });
  return User;
}
export async function LogIn(bodyData, url) {
  const { email, Password } = bodyData;

  const UserLoged = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!UserLoged) {
    return notFoundExeption("invalid info");
  }
  if (!UserLoged.confirmEmail) {
    return badRequestExeption("you need to confirm your email first ");
  }

  const ComparePass = await comparing({
    plainValue: Password,
    hashValue: UserLoged.Password,
  });
  console.log(ComparePass);

  if (!ComparePass) {
    return notFoundExeption("invalid info");
  }

  const OTP = generateOTP();

  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.LogIn,
    subject: "LogIn OTP",
  });

  // const bytes = CryptoJS.AES.decrypt(UserLoged.phone, ENCRYPTION_KEY);
  // const originalPhone = bytes.toString(CryptoJS.enc.Utf8);
  // UserLoged.phone = originalPhone

  return generateAccessAndRefreshToken(UserLoged);

  // const Refresh_Token = jwt.sign({ Sub: UserLoged.id }, refreshSignature, {
  //   noTimestamp: true,
  //   expiresIn: "1y",
  //   notBefore: 1,
  //   issuer: url, //"http//localhost/5000"
  //   audience: [UserLoged.Roll, tokenEnum.refresh],
  // });
  // const Access_Token = jwt.sign({  }, 'shhhhh',{subject:UserLoged.id.toString(),noTimestamp:true,expiresIn:10});
}
/*
isLogedIn
  const Access_Token = jwt.sign({ Sub: UserLoged.id }, 'shhhhh',{noTimestamp:true,subject:"asas"});
it.s wrong - you can add sub or subject
*/

async function VarifyGoogleIdToken(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export async function logInWithGoogle(idToken) {
  const payLoad = await VarifyGoogleIdToken(idToken);
  if (!payLoad.email) {
    return badRequestExeption("email Must Be varified");
  }
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: {
      email: payLoad.email,
      Providor: User_Providor.Google,
    },
  });
  if (!user) {
    return signUpWithGmail(idToken);
  }

  return generateAccessAndRefreshToken(user);
}

export async function signUpWithGmail(idToken) {
  const payLoadGoogleToken = await VarifyGoogleIdToken(idToken);

  if (!payLoadGoogleToken.email_verified) {
    return badRequestExeption("email must be varified");
  }
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email: payLoadGoogleToken.email },
  });

  if (user) {
    if (user.Providor == User_Providor.System) {
      return badRequestExeption(
        "email already exist - Login with your email and passward",
      );
    }
    return { status: 200, result: await logInWithGoogle(idToken) };
  }

  const AddUser = await dbRepo.Create({
    model: UserModel,
    data: {
      email: payLoadGoogleToken.email,
      UserName: payLoadGoogleToken.name,
      ProfilePic: payLoadGoogleToken.picture,
      confirmEmail: true,
      Providor: User_Providor.Google, // this will let you not have to enter password - USERMODEL FUNCTION
    },
  });
  console.log({ AddUser });

  return { result: generateAccessAndRefreshToken(AddUser), status: 201 };
}

export async function ConfirmEmail(DataBody) {
  const { OTP, email } = DataBody;
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email, confirmEmail: false },
  });
  if (!user) {
    return badRequestExeption("Invalid User or Email Already Confirmed");
  }

  const OTPStored = await RediesMethod.get(
    RediesMethod.getOTPKey({ email, emailType: EmailTypeEnums.ConfirmEmail }),
  );
  if (!OTPStored) {
    return badRequestExeption("OTP EXPIRED");
  }

  const ComparedOTP = await comparing({
    plainValue: OTP,
    hashValue: OTPStored,
  });
  console.log({ ComparedOTP });

  if (!ComparedOTP) {
    return badRequestExeption("INVALID OTP");
  }

  user.confirmEmail = true;
  user.save();
}

export async function resendOTPConfirmEmail(email) {
  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.ConfirmEmail,
    subject: "Another Confirm Your Email",
  });
}
export async function resendOTPLogin(email) {
  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.LogIn,
    subject: "Another LogIn OTP",
  });
}

export async function sendOTPForgerpassword(email) {
  const user = await dbRepo.findOne({ model: UserModel, filters: { email } });
  if (!user) {
    return;
  }
  if (!user.confirmEmail) {
    return badRequestExeption("you need to confirm your email first");
  }
  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.ForgetPassward,
    subject: "Reset your password",
  });
}

export async function verifyOTPForgetPassward(bodyData) {
  const { email, OTP } = bodyData;
  const OTPExist = await RediesMethod.get(
    RediesMethod.getOTPKey({ email, emailType: EmailTypeEnums.ForgetPassward }),
  );
  if (!OTPExist) {
    return badRequestExeption("OTP  EXPIRED");
  }
  const CompareOTP = await comparing({ plainValue: OTP, hashValue: OTPExist });
  if (!CompareOTP) {
    return badRequestExeption("OTP INVALID");
  }
}
export async function updateForgetPassword(bodyData) {
  const { email, OTP, Password } = bodyData;
  await verifyOTPForgetPassward({ email, OTP });
  await dbRepo.updateOne({
    model: UserModel,
    filter: { email },
    data: { Password: await hashing({ PlainText: Password }) },
  });

  return;
}

export async function resendOTPForgetPassword(email) {
  await SendEmailOTP({
    email,
    emailType: EmailTypeEnums.ForgetPassward,
    subject: "Another ForgetPassward OTP",
  });
}

import crypto from "crypto";

export async function sendResetLinkForgetPassword(email) {
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) {
    return badRequestExeption("User Not Found");
  }

  if (!user.confirmEmail) {
    return badRequestExeption("you need to confirm your email first");
  }


  const token = crypto.randomBytes(32).toString("hex");


  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 15 * 60 * 1000; 

  await user.save();

 
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;


  await sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });
}
// export function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // 6 أرقام
// }

// export async function signUpWithOTP(userData) {
//   const { email, UserName } = userData;

//   const otp = generateOTP();
//   const otpExpires = Date.now() + 5 * 60 * 1000; // 5 دقائق

//   const newUser = await dbRepo.Create({
//     model: UserModel,
//     data: {
//       email,
//       UserName,
//       OTP: otp,
//       OTPExpires: otpExpires,
//       confirmEmail: false,
//       Providor: User_Providor.System,
//     },
//   });

//   await sendEmail({
//     to: email,
//     subject: "Verify your account",
//     html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
//   });

//   return { message: "OTP sent to email" };
// }

// export async function verifyOTPService({ email, otp }) {
//   const user = await dbRepo.findOne({
//     model: UserModel,
//     filters: { email },
//   });

//   if (!user) throw badRequestExeption("User not found");
//   if (user.OTP !== otp) throw badRequestExeption("Invalid OTP");
//   if (user.OTPExpires < Date.now()) throw badRequestExeption("OTP expired");

//   user.confirmEmail = true;
//   user.OTP = null;
//   user.OTPExpires = null;

//   await user.save();

//   return generateAccessAndRefreshToken(user);
// }

/*
{
    iss: 'https://accounts.google.com',
    azp: '145851293811-mfp43e9ps948dmsdjgqpmskdhlgluchh.apps.googleusercontent.com',
    aud: '145851293811-mfp43e9ps948dmsdjgqpmskdhlgluchh.apps.googleusercontent.com',
    sub: '114706696193491683546',
    email: 'mahmoudbackend8@gmail.com',
    email_verified: true,
    nbf: 1772201294,
    name: 'mahmoud_backend',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocLNhC14TsUAc2hJcNHu_0ba9gs40AYgetfvHHF51lih4_Iq5w=s96-c',
    given_name: 'mahmoud_backend',
    iat: 1772201594,
    exp: 1772205194,
    jti: '479dbee627c873d14c836e366f6db7e44a4b90f4'
  }
}
*/

/*
resend otp logic

const previoudOTPTTL = await RediesMethod.ttl(
    RediesMethod.getOTPKey({ email, emailType: EmailTypeEnums.ConfirmEmail }),
  );
  if (previoudOTPTTL > 0) {
    return badRequestExeption(
      `you have valid otp - wait ${previoudOTPTTL} second `,
    );
  }

  const ReqBlocked = await RediesMethod.ttl(
    RediesMethod.getOTPKeyBlocked({
      email,
      emailType: EmailTypeEnums.ConfirmEmail,
    }),
  );
  if (ReqBlocked > 0) {
    return badRequestExeption(`you cant send OTP Remain Time ${ReqBlocked}M`);
  }
  const reqNum = await RediesMethod.get(
    RediesMethod.getOTPKeyAtempsNum({
      email,
      emailType: EmailTypeEnums.ConfirmEmail,
    }),
  );
  if (reqNum == 5) {
    await RediesMethod.set({
      key: RediesMethod.getOTPKeyBlocked({
        email,
        emailType: EmailTypeEnums.ConfirmEmail,
      }),
      value: 1,
      EXvalue: 5 * 60,
    });
    return badRequestExeption(
      `you can.t request more than 4 OTP in 20 Minutes `,
    );
  }
  const OTP = generateOTP();
  await sendMail({
    to: email,
    subject: EmailTypeEnums.ConfirmEmail,
    html: `<h1>${OTP}</h1>`,
  });
  await RediesMethod.set({
    key: RediesMethod.getOTPKey({
      email,
      emailType: EmailTypeEnums.ConfirmEmail,
    }),
    value: await hashing({ PlainText: OTP }),
    EXvalue: 120,
  });

  await RediesMethod.incr(
    RediesMethod.getOTPKeyAtempsNum({
      email,
      emailType: EmailTypeEnums.ConfirmEmail,
    }),
  );
*/
