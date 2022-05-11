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
    description: {
      type: String,
      required: true,
    }, 
    content: {
      type: String,
      required: true,
    },
    
    //   userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    //   },
    //   donateId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Donate',
    //     required: true
    //   }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
