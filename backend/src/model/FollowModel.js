const mongoose = require("mongoose");

const FollowModel = new mongoose.Schema(
  {
    userId: { type: String },
    friendId: { type: String },
    status: { type: Boolean }
  },
  {
    timestamps: true,
  }
);

const Follow = mongoose.model("follow", FollowModel, "follow");
export default Follow

