// create a testing controller
// Path: api\controllers\test.controller.js

const testController = {
  TestController: (req, res) => {
    res.status(200).json({"health_check":"__WORKING__"});
  },
};

module.exports = {
  testController,
};
