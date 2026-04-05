import express from "express";
import {
  ConfirmEmail,
  LogIn,
  logInWithGoogle,
  resendOTPConfirmEmail,
  resendOTPForgetPassword,
  resendOTPLogin,
  sendOTPForgerpassword,
  sendResetLinkForgetPassword,
  signUp,
  signUpWithGmail,
  updateForgetPassword,
  verifyOTPForgetPassward,
} from "./Auth.service.js";
import { successResponse } from "../../Commeon/Response/Response.js";

import { validation } from "../../MiddleWare/validation.MiddleWare.js";
import {
  ConfirmEmailScema,
  ResendotpConfirmEmailScema,
  resendOTPForgetPasswordScema,
  ResendotpLoginScema,
  sendOTPForgerpasswordScema,
  SignUpSchema,
  updateForgetPasswordScema,
  verifyOTPForgetPasswardScema,
} from "./Auth.validation.js";
import {
  allowFileFormats,
  localUpload,
} from "../../Commeon/Multer/Multer.Config.js";

const AuthRouter = express.Router();

AuthRouter.post("/SignUp", validation(SignUpSchema), async (req, res) => {
  const result = await signUp(req.body);
  return successResponse({ res, statusCode: 201, data: result });
});
AuthRouter.post("/SignUp/Gmail", async (req, res) => {
  const { status, result } = await signUpWithGmail(req.body.idToken);
  return successResponse({ res, statusCode: status, data: result });
});

export async function signUpController(req, res) {
  const result = await signUpWithOTP(req.body);
  return successResponse({ res, statusCode: 201, data: result });
}

export async function verifyOTPController(req, res) {
  const result = await verifyOTPService(req.body);
  return successResponse({ res, data: result });
}

AuthRouter.post("/signup", signUpController);
AuthRouter.post("/verify-otp", verifyOTPController);

AuthRouter.post("/LogIn", async (req, res) => {
  const result = await LogIn(req.body, `${req.protocol}://${req.host}`);

  return successResponse({ res, statusCode: 200, data: result });
});
AuthRouter.post(
  "/ConfirmEmail",
  validation(ConfirmEmailScema),
  async (req, res) => {
    const result = await ConfirmEmail(req.body);
    return successResponse({ res, data: "confirmed", statusCode: 201 });
  },
);

AuthRouter.post(
  "/resendOTPConfirmEmail",
  validation(ResendotpConfirmEmailScema),
  async (req, res) => {
    const result = await resendOTPConfirmEmail(req.body.email);
    return successResponse({ res, data: "check your email", statusCode: 200 });
  },
);

AuthRouter.post(
  "/resendLogInOTP",
  validation(ResendotpLoginScema),
  async (req, res) => {
    const result = await resendOTPLogin(req.body.email);
    return successResponse({ res, data: "check your email", statusCode: 200 });
  },
);

AuthRouter.post(
  "/OTP-ForgetPassward",
  validation(sendOTPForgerpasswordScema),
  async (req, res) => {
    const result = await sendOTPForgerpassword(req.body.email);
    return successResponse({ res, data: "check your inbox", statusCode: 200 });
  },
);
AuthRouter.post(
  "/OTP-VerifyForgetPassward",
  validation(verifyOTPForgetPasswardScema),
  async (req, res) => {
    const result = await verifyOTPForgetPassward(req.body);
    return successResponse({ res, data: "done", statusCode: 200 });
  },
);
AuthRouter.post(
  "/OTP-SetNewForgetPassward",
  validation(updateForgetPasswordScema),
  async (req, res) => {
    const result = await updateForgetPassword(req.body);
    return successResponse({ res, data: "PassUpdated", statusCode: 200 });
  },
);

AuthRouter.post(
  "/OTP-resendOTPForgetPassword",
  validation(resendOTPForgetPasswordScema),
  async (req, res) => {
    const result = await resendOTPForgetPassword(req.body.email);
    return successResponse({ res, data: "check your inbox", statusCode: 200 });
  },


  
);
AuthRouter.post(
  "/Link-sendLinkForgetPassword",
  validation(resendOTPForgetPasswordScema),
  async (req, res) => {
    const result = await sendResetLinkForgetPassword(req.body.email);
    return successResponse({ res, data: "check your inbox", statusCode: 200 });
  },


  
);



// AuthRouter.post("/LogInWithGoogle", async (req, res) => {
//   const result = await logInWithGoogle(req.body.);
//   return successResponse({ res, statusCode: 200, data: result });
// });
export default AuthRouter;
