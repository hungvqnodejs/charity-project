const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const donateSchema = new Schema(
  {
    money: {
      type: Number,
      required: true,
    },
    user: {
      userId: String,
      userName: String,
      numberPhone: String,
    },
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donate", donateSchema);
