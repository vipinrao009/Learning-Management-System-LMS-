import JWT from "jsonwebtoken";
import AppError from "../utils/error.utils.js";
import User from "../models/userModels.js";

const isLoggedIn = async (req, res, next) => {
   
   console.log("All Cookies:", req.cookies); // ✅ Debugging

  // extracting token from the cookies
  const { token } = req.cookies;
  console.log("Token from Cookies:", req.cookies.token);

  // if no token send unauthorized message
  if (!token) {
    return next(new AppError("Unauthorized,plz login again"), 400);
  }

  // Decode the token using JWT packege verify method
  const userDetails = await JWT.verify(token, process.env.JWT_SECRET); //token ko kbhi string me na dale

  // If no decode send the message unauthorized
  if (!userDetails) {
    return next(new AppError("I didn't get details after verify through JWT"));
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = userDetails;

  next();
};

export const authorizedRoles = (...roles) => (req,res,next)=>{
  const currentRoles = req.user.role 

  if(!roles.includes(currentRoles))
  {
    return next(new AppError('You do not have permission to access this route!!!',401))
  }

  next() // ye na bhulna 
}

export const authorizedSubscriber = async(req,res,next) =>{

  const user = await User.findById(req.user.id)
  if(user.role !== 'ADMIN' && user.subscription.status  !== 'active')
  {
    return next(
      new AppError('Please subscribe to access this routes',403)
    )
  }
  next();
}

export default isLoggedIn
