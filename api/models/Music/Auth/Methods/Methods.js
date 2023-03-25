module.exports = function (MusicSchema) {
  // add or remove a like or dislike from a music document and increment or decrement the corresponding count
  MusicSchema.methods.addLikeOrDislike = async function (
    _id,
    music_id,
    isLike
  ) {
    const authUser = await this.model("AuthenticatedUserModel")
      .findById(_id)
      .select("likedMusic");

    let likedMusic = authUser.likedMusic;

    // if the user is liking the music
    if (isLike) {
      // if the user has already liked the music, remove the like
      if (this.likes.includes(_id)) {
        this.likes = this.likes.filter((id) => id != _id);
        this.likesCount--;
        // if already liked the song then it must be in the likedMusic so remove
        likedMusic = likedMusic.filter((id) => id != music_id);
      }
      // if the user has already disliked the music, remove the dislike and add a like
      else if (this.dislikes.includes(_id)) {
        this.dislikes = this.dislikes.filter((id) => id != _id);
        this.dislikesCount--;
        this.likes.push(_id);
        this.likesCount++;
        // if already disliked the song then it must be in the likedMusic so add in the likedMusic list
        likedMusic.push(music_id);
      }
      // if the user has neither liked nor disliked the music, add a like
      else {
        this.likes.push(_id);
        this.likesCount++;
        // if already disliked the song then it must be in the likedMusic so add in the likedMusic list
        likedMusic.push(music_id);
      }
    }
    // if the user is disliking the music
    else {
      // if the user has already disliked the music, remove the dislike
      if (this.dislikes.includes(_id)) {
        this.dislikes = this.dislikes.filter((id) => id != _id);
        this.dislikesCount--;
      }
      // if the user has already liked the music, remove the like and add a dislike
      else if (this.likes.includes(_id)) {
        this.likes = this.likes.filter((id) => id != _id);
        this.likesCount--;
        this.dislikes.push(_id);
        this.dislikesCount++;
        // remove from the likedMusic list as well
        likedMusic = likedMusic.filter((id) => id != music_id);
      }
      // if the user has neither liked nor disliked the music, add a dislike
      else {
        this.dislikes.push(_id);
        this.dislikesCount++;
      }
    }
    // save the updated user document
    await authUser.save();

    // save the updated music document
    await this.save();
  };
};
