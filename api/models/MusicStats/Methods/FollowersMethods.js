module.exports = function(AuthenticatedUser){
    // follow another user
AuthenticatedUser.methods.follow = function (user) {
    if (this.following.indexOf(user._id) === -1) {
      this.following.push(user._id);
    }
    if (user.followers.indexOf(this._id) === -1) {
      user.followers.push(this._id);
    }
    return this.save().then(() => {
      return user.save();
    });
  };
  
  // unfollow another user
  AuthenticatedUser.methods.unfollow = function (user) {
    this.following.remove(user._id);
    user.followers.remove(this._id);
    return this.save().then(() => {
      return user.save();
    });
  };
  
  // check if user is following another user
  AuthenticatedUser.methods.isFollowing = function (user) {
    return this.following.some((followingId) => {
      return followingId.toString() === user._id.toString();
    });
  };
}