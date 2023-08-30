const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/productCategoryRouter");
const blogCategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");

const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
dbConnect();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", authRouter);
app.use("/api/products", productRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
