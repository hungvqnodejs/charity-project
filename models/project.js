const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxMoney: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true
    },
    numberBank: {
      type: String,
      required: true
    },
    nameBank: {
      type: String,
      required: true
    },
    userBank: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
    }, 
    content: {
      type: String,
      required: true,
    },
      donate: {
        totalDonate: Number,
        totalMoney: Number,
        percentageDonate: Number,
        countDonateWait: Number
      }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
