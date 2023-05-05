const mongoose = require("mongoose");

const ReportModel = new mongoose.Schema(
  {
    postId: String,
    categoryId: String,
    userId: String,
    description: String
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("report", ReportModel, "report");
export default Report

