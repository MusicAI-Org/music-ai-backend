const { set, connect } = require("mongoose");
require("dotenv").config();

set("strictQuery", false);

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (err) {
    console.error("Not connected to internet");
    
  }
};

module.exports = connectDB;
