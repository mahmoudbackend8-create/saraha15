import express from "express";
import * as ENV from "../Config/Config.service.js";
import { testConnection } from "./DB/Connection.js";
import AuthRouter from "./Modules/Auth/Auth.controller.js";
import { globalErrHndling } from "./Commeon/Response/Response.js";
import UserRouter from "./Modules/User/User.Controller.js";
import cors from "cors";
import path from "path";
import redisConnection, { client } from "./DB/Radis.connection.js";
import MessageRouter from "./Modules/Message/Message.Controller.js";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geoLite from "geoip-lite";
import * as redisMethods from "./DB/DB.models/redis.service.js";

let port = ENV.PORT;
async function appBootstrap() {
  await testConnection();

  await redisConnection();

  // await client.set("mahmoud", "mahmoud21", {
  //   expiration: { type: "EX", value: 300 },
  // });
  // await client.persist("mahmoud"); // delete EX time
  const app = express();
  const corsOptions = { origin: ["http://localhost5000"] }; //allow who frontEnd can send req - PUT IN CORS
  /*
   app.set("trust proxy", true);
when you make trust proxy is true (req.ip will take value ok key req.headers['x-forwarded-for']) and it.s ip of the user

*/
  app.set("trust proxy", true);
  app.use(
    express.json(),
    cors({ methods: "GET", origin: ["http://localhost5000"] }),
    helmet(),

    rateLimit({
      windowMs: 1 * 60 * 1000,
      limit: (req, res) => {
        const geoInfo = geoLite.lookup(req.ip)||{};
        return geoInfo.country == "EG" ? 2 : 0; //block any request coming from outside egypt
      },
      legacyHeaders: false,
      message: "stop ya baba",
      handler: (req, res) => {
        // having periority
        return res.status(400).json({ msg: "stop tany" });
      },
      requestPropertyName: "adding_KeyObj_in_req",
      keyGenerator: (req) => {
        const ip = ipKeyGenerator(req.ip); //this becasue we have 2 version of ip (v4 , v6) we extract just one to use it (توحيد ip)
        console.log(ip);
  
        return `${ip}-${req.path}`; //req.ip (ip of server) - req.path ( like signup - login) ( generate key limit for every api)
      }, //we must put req.ip of the user to avoid making block for all user
      //ratLimit stored in memory - restarting server delete it
      store: {
        incr: async (key, cb) => {
          //keyGenerator will take this function to run
          const hits = await redisMethods.incr(key); //we use redis to store key in it to avoid delete it when restart server
          if (hits == 1) {
            await redisMethods.setExpire(key, 1 * 60); //limit time the same of windowMs: 1 * 60 * 1000,
          }
          cb(null, hits);
        },
        decrement: async (key) => {
          //will run when you active (skipFailedRequests: true,)or(skipSuccessfulRequests:true)
          const isKeyExist = await redisMethods.isKeyExistF(key);
          if (isKeyExist) {
            await redisMethods.decr(key);
          }
        },
      },
      skipFailedRequests: true,
      // skipSuccessfulRequests:true
    }),
  );
  /*
   app.set("trust proxy", true);
when you make trust proxy is true (req.ip will take value ok key req.headers['x-forwarded-for']) and it.s ip of the user

*/
  app.use("/", (req, res, next) => {
    console.log(req.headers["x-forwarded-for"]);
    console.log(req.ip);

    console.log({ "req.limit": req.adding_KeyObj_in_req });
    next();
  });
  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/Auth", AuthRouter);
  app.use("/User", UserRouter);
  app.use("/Message", MessageRouter);
  app.use(globalErrHndling);
  app.listen(port, () => {
    console.log(`Server is Running on Port:: ${port}`);
  });
}

export default appBootstrap;

/*
core
W14 S1 V5 M6
we can use it to control which forntEnd Cant acccess my backEnd
 */
