import {
  badRequestExeption,
  notFoundExeption,
} from "../../Commeon/Response/Response.js";
import MessageModel from "../../DB/DB.models/Message.model.js";
import UserModel from "../../DB/DB.models/Users.model.js";
import * as DBRepo from "../../DB/DB.Repository.js";

export async function SendMessage(Contact, ReceiverID, FileData, SenderID) {
  const Receiver = await DBRepo.findById({ model: UserModel, id: ReceiverID });

  if (!Receiver) {
    return badRequestExeption("User Not Found");
  }

  await DBRepo.Create({
    model: MessageModel,
    data: {
      Contact,
      ReceiverID,
      attachments: FileData.map((file) => {
        return file.finalPath;
      }),
      //   FileData.map((file) =>file.finalPath - shortCut
      SenderID,
    },
  });
}
export async function GetMessageById(userData, MessageId) {
  const result = await DBRepo.findOne({
    model: MessageModel,
    filters: { _id: MessageId, ReceiverID: userData._id },
    selelct: "-SenderID", // selelct:"-SenderID" (to hide the person who sent)
  });
  if (!result) {
    return notFoundExeption("invalid MessageId");
  }
  return result;
}
export async function GetAllMesasges(userId) {
  const result = await DBRepo.Find({
    model: MessageModel,
    filter: { $or: [{ ReceiverID: userId }, { SenderID: userId }] },
    select: "-SenderID",
  });

  if (!result.length) {
    return notFoundExeption("NO Message Founded");
  }
  return result;
}

export async function removeMessage(userData, MessageId) {
  const MessageD = await DBRepo.Delete({
    model: MessageModel,
    filters: { _id: MessageId, ReceiverID: userData },
  });
  if (!MessageD.deletedCount) {
    return notFoundExeption("no message founded");
  }
  return MessageD;
}
