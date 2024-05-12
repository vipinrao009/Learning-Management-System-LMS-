import User from "../models/userModels.js";
import cloudinary from "cloudinary";
import AppError from "../utils/error.utils.js";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";


const home = (req, res) => {
  res.status(200).json({
    messsage: "This is the home page created by vipin kumar",
  });
};

const register = async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { fullName, email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!fullName || !email || !password) {
    return next(new AppError("All fiels are required", 400));
  }

  // Check if the user exists with the provided email
  const userExist = await User.findOne({ email });

  // If user exists send the reponse
  if (userExist) {
    return next(AppError("Email is already exist !!!", 400));
  }

  // const hashPassword = await bcrypt.hash(password,10)  ||this is not using bcz we have made this in model
  // Create a new user with the given necessary data and save to DB
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    },
  });

  //If user data not created send message response
  if (!user) {
    return next(AppError("User registration failed, plz try again", 400));
  }

  //console.log('File details',JSON.stringify(req.file));
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: "fill",
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || "File not uploaded, please try again", 400)
      );
    }
  }

  //Save the user object
  await user.save();

  user.password = undefined;

  // generate the token
  const token = await user.generateJWTToken();

  const CookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    httpOnly:false,
    secure:true,
  };

  //Setting the token in cookie with name token along with cookieOption
  res.cookie("token", token, CookieOptions);

  //If all good then send the response to the fronted
  res.status(200).json({
    success: true,
    message: "User registered successfully!!!!",
    user,
  });
  
};

const login = async (req, res,next) => {
  // Destructuring the necessary data from req object
  const { email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  try {
    // Finding the user with the sent email
    const user = await User.findOne({ email }).select("+password");

    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError(
          "Email or Password do not match or user does not exist",
          401
        )
      );
    }

    // Generating a JWT token
    const token = await user.generateJWTToken();

    // Setting the password to undefined so it does not get sent in the response
    user.password = undefined;

    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      httpOnly: true,
      secure:false
      //I took mistake here that was secure : true
    };

    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie("token", token, cookieOptions);

    // If all good send the response to the frontend
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError("Error occured", 401));
  }
};

const logOut = async (req, res) => {
  try {
    const cookieOption = {
      expiresIn: new Date(),
      httpOnly: true,
    };

    res.cookie("token", null, cookieOption);

    res.status(200).json({
      success: true,
      message: "User logged out successfully !!!",
    });
  } catch (error) {
    return next(new AppError(error.messsage), 400);
  }
};

const getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      messsage: "User Details !!!",
      user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetched the user data"), 400);
  }
};

const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  //if user don't provide  email then send the
  if (!email) {
    return next(new AppError("Email is required!!!", 400));
  }

  //Match email in db
  const user = await User.findOne({ email });

  //if the email not matched in databases
  if (!user) {
    return next(new AppError("Email is not registerd!!!!", 400));
  }

  const resetToken = await user.generateResetToken();

  // token ko save kar lo db me
  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  console.log(resetPasswordURL);

  // We here need to send an email to the user with the token
  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password link has been sent to ${email} successfully`,
    });
  } catch (error) {
    //in case email send nhi huaa
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    return next(new AppError(error.message, 400));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  console.log({password});

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  if (!password) {
    return next(new AppError("Password is required", 401));
  }

  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
  });
  if (!user) {
    return next(new AppError("Token is invalid or expired !!!", 401));
  }

  // Update the password if token is valid and not expired
  user.password = password;

  // making forgotPassword undefined in the DB after the updated the password
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // Save the updated user values
  user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully !!!!",
  });
};

const changePassword = async (req, res,next) => {
  // Destructuring the necessary data from the req object
  const { oldPassword, newPassword } = req.body;

  const id = req.user.id; // because of the middleware isLoggedIn
  
  //compare the password
  if (!oldPassword || !newPassword) {
    return next(
      new AppError("Old password and new password are required !!!", 401)
    );
  }

  //findind the user by id and selecting the password
  const validUser = await User.findById(id).select("+password");

  // user is not valid then send the response
  if (!validUser) {
    return next(
     new AppError("Invalid user id or user does not exist!!", 401)
    );
  }
  
  //Check the old password is correct
  const isPasswordValid = await validUser.comparePassword(oldPassword)

  //if old password is not correct then send the response
  if(!isPasswordValid)
  {
    return next(new AppError('Invalid old password!!',401))
  }

  // if old password is valid the update the password
  validUser.password = newPassword
  
  //save the data in db
  await validUser.save()
  
  // Setting the password undefined so that it won't get sent in the response
  validUser.password = undefined

  res.status(200).json({
    success:true,
    message:"Password is changed successfully!!"
  })
};

const updateProfile  =async (req, res, next) => {
  // Destructuring the necessary data from the req object
  const { fullName } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("Invalid user id or user does not exist"));
  }

  if (fullName) {
    user.fullName = fullName;
  }

  // Run only if user sends a file
  if (req.file) {
    // Deletes the old image uploaded by the user
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: "fill",
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || "File not uploaded, please try again", 400)
      );
    }
  }

  // Save the user object
  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
};


export {
  home,
  register,
  login,
  logOut,
  getUser,
  forgetPassword,
  resetPassword,
  changePassword,
  updateProfile
};
