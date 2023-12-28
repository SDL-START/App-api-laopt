const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.language.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
