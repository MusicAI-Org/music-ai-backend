/*
  @importing the modules
*/
const cors = require("cors");
const http = require("http");
const express = require("express");
const router = require("./api/routes");
const bodyParser = require("body-parser");
const socketConnections = require("./api/socketio");
const webrtcConnections = require("./api/webRTC");
const connectDB = require("./api/config/connectDB");

require("dotenv").config();

// creating the server
const app = express();
const server = http.createServer(app);

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

// socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// routes
app.use("/api", router);
app.use("/sockets", socketConnections(io));
app.use("/web-rtc", webrtcConnections(io));
app.get("/", (req, res) => {
  res.status(201).json("all okay");
});

const PORT = process.env.PORT;
server.listen(PORT, function () {
  console.log(`Server is up on ${PORT}`);
});
