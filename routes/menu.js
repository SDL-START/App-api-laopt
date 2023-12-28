const { PrismaClient } = require("@prisma/client");
const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.menu.findMany({
      where: {
        status: "ACTIVE",
        role: req["user"]["role"],
      },
      orderBy: {
        position: "asc",
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

module.exports = router;
