const router = require("express").Router();
const { testController } = require("../controllers/test.controller");

router.get("/", (req, res) => {
  testController.TestController(req, res);
});

module.exports = router;