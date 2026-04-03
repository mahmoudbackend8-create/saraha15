import express from "express";
import { successResponse } from "../../Commeon/Response/Response.js";
import {
  coverProfilePic,
  getAnotherProfile,
  logOut,
  renewToken,
  updatePassword,
  uploadProfilePic,
} from "./User.Service.js";
import { authentication } from "../../MiddleWare/authentication.MiddleWare.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import { authorization } from "../../MiddleWare/authorization.MiddleWare.js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
import {
  allowFileFormats,
  localUpload,
} from "../../Commeon/Multer/Multer.Config.js";
import { validation } from "../../MiddleWare/validation.MiddleWare.js";
import {
  coverPicSchema,
  getAnotherUserProfileSchema,
  profilePicSchema,
  UpdatePasswordSchema,
} from "./User.Validation.js";
const UserRouter = express.Router();
UserRouter.get(
  "/GetUserById",
  authentication(),
  authorization([User_Roll.Admin]),
  async (req, res) => {
    return successResponse({ res, statusCode: 200, data: req.user });
  },
);
UserRouter.post(
  "/renewToken",
  authentication(tokenEnum.refresh),

  async (req, res) => {
    const result = await renewToken(req.user);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.post(
  "/upload_mainPic",
  authentication(),
  localUpload({
    folderName: "Users",
    allowedFormates: allowFileFormats.img,
    fileSize: 1,
  }).single("ProfilePic"),
  validation(profilePicSchema),
  async (req, res) => {
    console.log(req.file);
    const result = await uploadProfilePic(req.user._id, req.file);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.post(
  "/upload_coverPic",
  authentication(),
  localUpload({
    folderName: "Users",
    allowedFormates: allowFileFormats.img,
    fileSize: 1,
  }).array("coverPic", 2),
  validation(coverPicSchema),
  async (req, res) => {
    console.log(req.file);
    const result = await coverProfilePic(req.user._id, req.files);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.get(
  "/getAnotherProfile/:profileId",
  validation(getAnotherUserProfileSchema),
  async (req, res) => {
    const result = await getAnotherProfile(req.params.profileId);
    return successResponse({ res, data: result, statusCode: 200 });
  },
);

UserRouter.post("/logOut", authentication(), async (req, res) => {
  const result = await logOut(req.user, req.payLoad, req.body.LogOutOption);
  return successResponse({ res, statusCode: 200, data: result });
});

UserRouter.patch("/updatePassword",authentication(),  validation(UpdatePasswordSchema), async (req, res) => {
  const result = await updatePassword(req.body, req.user);
  return successResponse({ res, data: "Password Updated", statusCode: 200 });
});
export default UserRouter;
/*
-- string
set firstname mahmoudf EX 30
keys *
keys *
ttl firstname^C
-1 don.t have exDates
-2 not exist
del name
PERSIST name1 - delete EXTime from Filed
EXPIRE name 900 -- add expire time to the field
keys key* -- bring all keys start with key
mget key4 name -- bring values of multiKeys
 -- hash (object) --
 hset userInfo name mahmoud age 10 -- add recourd
hget userInfo age -- get data from hash
hmget userInfo age name - get multi data
hkeys userInfo - get keys
hgetall userInfo - get keys and values
hexists userInfo age -- result 0 or 1 
-- list (array) -- 
lpush cars 7787 5544 -- adding
lpuchx -- adding if filed exist
lrange cars 0 0 -- get data (index 0)
lset - adding in array
lrem - delete
lrange cars 0 -1 - get all data in array
ltrim cars 2 3 - delete index 2 3
lpop -- delete and get 
rpush -- adding in last of array
-- unique array -- 
sadd nums 1234 123 456 - adding in array unique
smembers nums - get data



sadd n1 10 20 30 40
4
➜
sadd n2 40 50 60 70
4
➜
sdiff n1 n2 -- what is in n1 not in 2n
10, 20, 30 





sadd n3 1 2 3 4
4
➜
sadd n4 4 5 6 7
4
➜
sinter n3 n4-- what is in two arrays
4

sunion n3 n4 -- collect all in one array[]


list is array - set array Unique




flushall - del all keys




*/
