const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.insurancetype.findMany({
      where: {
        status: "ACTIVE",
        deleted: false,
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const items = await prisma.insurancetype.findMany({
      where: {
        status: "ACTIVE",
        deleted: false,
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});
module.exports = router;
