const mongoose = require("mongoose");

const SocketModel = new mongoose.Schema(
  {
    socketId: String,
    userId: String
  },
  {
    timestamps: true,
  }
);

const Socket = mongoose.model("socket", SocketModel, "socket");
export default Socket

