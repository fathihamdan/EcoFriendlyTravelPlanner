const express = require("express");

const router = express.Router();

const Place = require("../models/Place");

router.get("/", async (req, res) => {

    try {

        const places = await Place.find();

        res.json(places);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;