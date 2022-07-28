const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const donateSchema = new Schema(
  {
    payments: String,
    tradingCode: String,
    bank: String,
    status: Boolean,
    money: {
      type: Number,
      required: true,
    },
    user: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },
      userName: String,
      email: String,
      numberPhone: String,
    },
    project: {
      projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },
      title: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donate", donateSchema);
