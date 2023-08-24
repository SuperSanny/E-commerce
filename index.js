const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");

dbConnect();
const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());

// app.use("/", (req, res) => {
//   res.send("Hello from server side!");
// });

app.use("/api/users", authRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
