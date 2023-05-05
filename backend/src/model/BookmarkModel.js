const mongoose = require("mongoose");

const BookmarkModel = new mongoose.Schema(
  {
    userId: { type: String },
    postId: { type: String },
    status: { type: Boolean }
  },
  {
    timestamps: true,
  }
);

const Bookmark = mongoose.model("bookmark", BookmarkModel, "bookmark");
export default Bookmark

