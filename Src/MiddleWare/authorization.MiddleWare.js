import { User_Roll } from "../Commeon/Enums/User.Enums.js";
import { forbiddenExeption } from "../Commeon/Response/Response.js";

export function authorization(roles = [User_Roll.User]) {
  return (req, res, next) => {
    // console.log(req.user);
    
    // console.log(req.user.Roll);
    // console.log(roles);
    
  

    if (!roles.includes(req.user.Roll)) {
      return forbiddenExeption("don.t have autorization to Access this API");
    }
    next()
  };
}
