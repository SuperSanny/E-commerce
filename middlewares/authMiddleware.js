const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        // console.log(req.user);
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized token expired, Please Login agian");
    }
  } else {
    throw new Error("THis is no token attached to headers");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req?.user;
  const adminUser = await User.findOne({ email: email });
  if (adminUser.role !== "admin") {
    res.json({ msg: "you are not an admin.", status: false });
    throw new Error("You are not an admin.");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };

// let token;
//   if (req?.headers?.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//     try {
//       if (token) {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded?.id);
//         req.user = user;
//         next();
//       }
//     } catch (error) {
//       throw new Error("Not Authorized token expired, Please Login agian");
//     }
//   } else {
//     throw new Error("THis is no token attached to headers");
//   }
