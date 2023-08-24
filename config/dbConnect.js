const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URL);
    console.log(
      "Databse connected: ",
      connect.connection.host,
      connect.connection.name
    );
    // await mongoose.connect("mongodb://127.0.0.1:27017/a2zbazzar", {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    // console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Database error: ", error);
    process.exit(1);
  }
};
module.exports = dbConnect;
