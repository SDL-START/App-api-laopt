const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const prisma = new PrismaClient();
const logger = require("../utils/logger");

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.imageslide.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

module.exports = router;
