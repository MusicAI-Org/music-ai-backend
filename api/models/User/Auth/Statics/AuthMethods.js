module.exports = function (AuthenticatedUserSchema) {
  // update user name
  AuthenticatedUserSchema.statics.isThisIdInUse = async function (_id) {
    // console.log("id", _id);
    if (!_id) throw new Error("Invalid Access");
    try {
      const user = await this.findById(_id);
      console.log(user);
      // if (!user) return false;

      return true;
    } catch (error) {
      console.log("error inside isThisEmailInUse method", error.message);
      return false;
    }
  };
};
