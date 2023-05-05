const mongoose = require("mongoose");

const ShareModel = new mongoose.Schema(
  {
    userId: { type: String },
    postId: { type: String },
    destination: { type: String },
  },
  {
    timestamps: true,
  }
);

const Share = mongoose.model("share", ShareModel, "share");
export default Share

