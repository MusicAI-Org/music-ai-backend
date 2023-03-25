module.exports = function (AuthenticatedUser) {
  // update user name
  AuthenticatedUser.methods.updateUserName = function (userName) {
    try {
      this.userName = userName;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // update avatar name
  AuthenticatedUser.methods.updateAvatarName = function (avatarName) {
    try {
      this.avatarName = avatarName;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // update avatar image
  AuthenticatedUser.methods.updateAvatarURL = function (photoURL) {
    try {
      this.avatarImg = avatarImg;
    } catch (e) {
      console.log(e);
    }
  };

  // update phone number
  AuthenticatedUser.methods.updatePhoneNumber = function (phoneNumber) {
    try {
      this.phoneNumber = phoneNumber;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // return user data
  AuthenticatedUser.methods.fetch = function () {
    return {
      _id: this.id,
      role: this.role,
      genre: this.genre,
      email: this.email,
      username: this.username,
      avatarImg: this.avatarImg,
      phoneNumber: this.phoneNumber,
      yearOfJoining: this.yearOfJoining,
      creditsForGraph: this.creditsForGraph,
      creditsForGraphUpdatedAt: this.creditsForGraphUpdatedAt,
    };
  };
};
