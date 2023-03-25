// const { MongoClient } = require("mongodb");
// const { set, connect } = require("mongoose");
// require("dotenv").config();
// const client = new MongoClient(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000, // increase timeout to 30 seconds
//   socketTimeoutMS: 480000, // increase socket timeout to 8 minutes
// });

// set("strictQuery", false);
// let db;
// const connectDB = async () => {
//   try {
//     // connect(process.env.MONGO_URI);
//     await client.connect();
//     db = client.db(process.env.DB_NAME);

//     console.log("DB Connected");
//   } catch (err) {
//     console.error(err.message);
//     // Exit process with failure
//     process.exit(1);
//   }
// };

// const getDB = () => db;
// // export default getDB;
// module.exports = { connectDB, getDB };


const{ set, connect } = require("mongoose");
require("dotenv").config();

set("strictQuery", false);

const connectDB = async () => {
  try {
    connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
}

module.exports = connectDB;