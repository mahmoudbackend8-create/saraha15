import express from "express";
import {
  allowFileFormats,
  localUpload,
} from "../../Commeon/Multer/Multer.Config.js";
import {
  badRequestExeption,
  successResponse,
} from "../../Commeon/Response/Response.js";
import {
  GetAllMesasges,
  GetMessageById,
  removeMessage,
  SendMessage,
} from "./Message.Service.js";
import { authentication } from "../../MiddleWare/authentication.MiddleWare.js";
import { validation } from "../../MiddleWare/validation.MiddleWare.js";
import { GetMSGById, SendMessageSchema } from "./Message.Validation.js";
const MessageRouter = express.Router({caseSensitive:true,strict:true});
MessageRouter.post(
  "/:ReceiverID",
  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
      const AuthMiddleWare = authentication();
      return AuthMiddleWare(req, res, next);
      // return authentication()(req, res, next) - or this
    }
    next();
  },
  localUpload({
    folderName: "Messages",
    allowedFormates: [...allowFileFormats.img, ...allowFileFormats.video],
  }).array("GetAttachments", 5),
  validation(SendMessageSchema),
  async (req, res) => {
    if (!req.body && !req.files) {
      return badRequestExeption("You must add a content or an atachment");
    }
    await SendMessage(
      req.body.Contact,
      req.params.ReceiverID,
      req.files,
      req.user?._id,
    );
    return successResponse({ res, statusCode: 200, data: "Message Sended" });
  },
);
MessageRouter.get(
  "/GetMshById/:MessageId",
  authentication(),
  validation(GetMSGById),
  async (req, res) => {
    const result = await GetMessageById(req.user, req.params.MessageId);
    return successResponse({ res, statusCode: 200, data: result });
  },
);
MessageRouter.get("/Get-All-Messages", authentication(), async (req, res) => {
  const result = await GetAllMesasges(req.user._id);
  return successResponse({ res, statusCode: 200, data: result });
});

MessageRouter.delete("/dd/:MessageId",authentication(),async(req,res)=>{
const result = await removeMessage(req.user,req.params.MessageId)
return successResponse({res,statusCode:200,data:"Mesaage Deleted"})
})
export default MessageRouter;
