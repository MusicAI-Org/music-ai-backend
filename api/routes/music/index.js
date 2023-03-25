// import the user.routes.js routes here
const router = require("express").Router();

const basicUserRouter = require("./BasicUserMusic/basicUserRoutes");
const authUserRouter = require("./AuthUserMusic/authUserRoutes");
const jwtCheck = require("../../middlewares/AuthMiddleware");


// jwt-pipeline for auth routes

// jwtcheck here
router.use("/authMusic", authUserRouter); // route complete

// no jwtcheck
router.use("/basicMusic", basicUserRouter); // route complete

module.exports = router;
