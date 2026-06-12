const CarbonHistory = require("../models/CarbonHistory");

const saveCalculation = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    const {
      transportMethod,
      transportDistance,
      transportPassengers,
      transportEmissions,
      accomType,
      accomNights,
      accomEmissions,
      totalEmissions,
      impactLevel,
    } = req.body;

    if (totalEmissions === undefined || isNaN(totalEmissions)) {
      return res.status(400).json({ message: "Invalid totalEmissions value." });
    }

    if (totalEmissions <= 0) {
      return res
        .status(400)
        .json({ message: "Nothing to save — total emissions is 0." });
    }

    const record = new CarbonHistory({
      userId,
      transportMethod: transportMethod || "",
      transportDistance: transportDistance || 0,
      transportPassengers: transportPassengers || 1,
      transportEmissions: transportEmissions || 0,
      accomType: accomType || "",
      accomNights: accomNights || 0,
      accomEmissions: accomEmissions || 0,
      totalEmissions,
      impactLevel: impactLevel || "",
    });

    await record.save();

    res.status(201).json({ message: "Calculation saved!", data: record });
  } catch (err) {
    console.error("saveCalculation error:", err.message);
    res.status(500).json({ message: "Server error while saving calculation." });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await CarbonHistory.find({ userId }).sort({
      createdAt: -1,
    }); // newest first

    res.status(200).json({ data: history });
  } catch (err) {
    console.error("getHistory error:", err.message);
    res.status(500).json({ message: "Server error while fetching history." });
  }
};

const deleteCalculation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await CarbonHistory.findOne({ _id: id, userId });

    if (!record) {
      return res
        .status(404)
        .json({ message: "Record not found or not yours to delete." });
    }

    await record.deleteOne();
    res.status(200).json({ message: "Record deleted." });
  } catch (err) {
    console.error("deleteCalculation error:", err.message);
    res.status(500).json({ message: "Server error while deleting record." });
  }
};

module.exports = { saveCalculation, getHistory, deleteCalculation };
