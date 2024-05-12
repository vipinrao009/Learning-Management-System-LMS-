import {Router} from "express";
import {home,register,login,getUser,logOut,forgetPassword,resetPassword,changePassword, updateProfile} from"../controllers/userControllers.js"
import isLoggedIn  from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";
import { getRazorKey } from "../controllers/payment.controllers.js";
const router = Router();

router.get('/home',home)
router.post('/register',upload.single("avatar"),register)
router.post('/login',login)
router.get('/getuser',isLoggedIn,getUser)
router.get('/logout',isLoggedIn,logOut)
router.post('/forget',forgetPassword)
router.put('/update/:id',isLoggedIn,upload.single("avatar"),updateProfile)
router.post('/reset/:resetToken',resetPassword)
router.post('/changepassword',isLoggedIn,changePassword)
router.get('getrazorkey',getRazorKey)


export default router; 