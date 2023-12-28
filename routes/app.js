const express = require("express");
const router = express.Router();

router.get("/version", async (req, res) => {
  try {
    res.send({
      version: 1,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = router;
