const mongoose = require("mongoose");

const CarbonHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Transport fields
    transportMethod: { type: String, default: "" },
    transportDistance: { type: Number, default: 0 },
    transportPassengers: { type: Number, default: 1 },
    transportEmissions: { type: Number, default: 0 },

    // Accommodation fields
    accomType: { type: String, default: "" },
    accomNights: { type: Number, default: 0 },
    accomEmissions: { type: Number, default: 0 },

    // Summary
    totalEmissions: { type: Number, required: true },
    impactLevel: { type: String, default: "" }, // "Low Impact", "Medium Impact", "High Impact"
  },
  { timestamps: true },
);

module.exports = mongoose.model("CarbonHistory", CarbonHistorySchema);
