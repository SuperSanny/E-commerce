const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const crypto = require("crypto");
//Create A User
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new User
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    //User already exists
    res.json({ msg: "User already exists", success: false });
    throw new Error("User already exists");
  }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists or not
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?.id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      _id: findUser?.id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    res.json({ msg: "Invalid Credentials", success: false });
    throw new Error("Invalid Credentials");
  }
});

// Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken) {
    res.status(204).send();
    throw new Error("No Refresh Token in  Cookies.");
  }
  const refreshToken = cookie.refreshToken;
  // console.log(refreshToken);
  const user = await User.findOne({
    refreshToken: refreshToken,
  });
  if (!user) throw new Error("NO Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id != decoded.id)
      throw new Error("There is something wrong with refresh token");
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
  res.json(user);
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    res.status(204).send();
    throw new Error("No Refresh Token in  Cookies.");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(204).send();
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return res.status(204).send();
});

//Get All Users
const getallUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    res.json({ msg: error, success: false });
    throw new Error(error);
  }
});

//Get a single User
const getUser = asyncHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (error) {
    res.json({ msg: error, success: false });
    throw new Error(error);
  }
});

//Delete a single User
const deleteUser = asyncHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (error) {
    res.json({ msg: error, success: false });
    throw new Error(error);
  }
});

//Update a single User
const updateUser = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const { id } = req.user;
  validateMongoDbId(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body.firstname,
        lastname: req?.body.lastname,
        email: req?.body.email,
        mobile: req?.body.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    res.json({ msg: error, success: false });
    throw new Error(error);
  }
});

//Block User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json({ message: "User Blocked", id: blockUser._id });
  } catch (error) {
    res.json({ error: error });
    throw new Error(error);
  }
});

//UnBlock User
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblockUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({ message: "User Unblocked", id: unblockUser._id });
  } catch (error) {
    res.json({ error: error });
    throw new Error(error);
  }
});

//Update Password
// const updatePassword = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { password } = req.body;
//   // validateMongoDbId(_id);
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }
//     if (password) {
//       user.password = password;
//       console.log(user.password);
//       const updatePassword = await user.save();
//       res.json(updatePassword);
//     } else {
//       res.json(user);
//     }
//   } catch (error) {
//     console.error("Error updating password:", error);
//     res.status(500).json({ error: "Failed to update password." });
//   }
// });
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  // validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (password) {
      user.password = password;
      console.log("Updating password:", user.password);
      const updatedUser = await user.save();
      console.log("Password updated successfully!");
      res.json(updatedUser);
    } else {
      res.status(400).json({ error: "Password is required." });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// Generate Forgot Password Token
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/users/reset-password/${token}'>Click here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    console.error("Error forgot password token:", error);
    res.status(500).json({ error: "Failed to forgot password token." });
  }
});

// reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

module.exports = {
  createUser,
  loginUser,
  getallUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
};
