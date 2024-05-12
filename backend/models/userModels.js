import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { strict } from "assert";
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      minlength: [5, "Name must be at least 5 characters"],
      lowercase: true,
      trim: true, // Removes unnecessary spaces
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ], // Matches email against regex
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Will not select password upon looking up a document
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription:{
      id:String,
      status:String
    }
  },
  {
    timestamps: true,
  }
);

// Hashes password before saving to the database
userSchema.pre("save", async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10); //jo password aa rha hai user ke through use db me save karne se pahle hash kar do
});

userSchema.methods = {
  // method which will help us compare plain password with hashed password and returns true or false
  comparePassword: async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  },

  // Will generate a JWT token with user id as payload
  generateJWTToken: async function () {
    return await jwt.sign(
      { id: this._id, role: this.role, subscription: this.subscription },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },

  //generateResetToken
  generateResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString('hex')
    
     // chahe to ham reset Token ko forgotPasswordToken me dal skte hai lekin ye bad practice hogi 😒 => jab bhi hm db me kisi security se releted chiz rakhate hai to kosis karni chaiye ki use simple ke bajay crypto se encript karake rkhe
    this.forgotPasswordToken = crypto
    .createHash('sha256')       
    .update(resetToken)
    .digest('hex') 
    this.forgotPasswordExpiry = Date.now() + 15*60*100 // 15 minutes from now
    return resetToken;  //mai yahi par glti kiya tha aur bahut pareshaan huaa tha
  },
};

const User = model("User", userSchema);

export default User;
