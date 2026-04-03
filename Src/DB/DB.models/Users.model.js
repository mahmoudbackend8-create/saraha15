import mongoose from "mongoose";
import {
  User_Gender,
  User_Providor,
  User_Roll,
} from "../../Commeon/Enums/User.Enums.js";

const UserSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: function () {
        return this.Providor == User_Providor.System; //equal true
      },
    },
    DOB: {
      type: Date,
    },
    phone: String,
    gender: {
      type: String,
      enum: Object.values(User_Gender),
      default: User_Gender.Male,
    },
    Roll: {
      type: String,
      enum: Object.values(User_Roll),
      default: User_Roll.User,
    },
    confirmEmail: { type: Boolean, default: false },
    Providor: {
      type: String,
      enum: Object.values(User_Providor),
      default: User_Providor.System,
    },
    ProfilePic: String,
    coverFilePic: [String],
    OTP: {
      type: String,
    },
    OTPExpires: {
      type: Date,
    },
    ChangeCreditTime: Date,
  },

  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
