const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/live", async (req, res) => {
  try {
    let params = req.query;
    let location = await prisma.location_log.findFirst({
      where: {
        messageId: Number(params.messageId),
      },
      include: {
        sos_messages: true,
      },
    });
    return res.status(200).send(location);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    let body = req.body;
    let location = await prisma.location_log.create({
      data: body,
    });
    return res.status(200).send(location);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.put("/", async (req, res) => {
  try {
    let body = req.body;
    let messageId = req.query.messageId;
    await prisma.location_log.updateMany({
      data: body,
      where: {
        messageId: Number(messageId),
      },
    });
    return res.status(200).json({
      status: 200,
      message: "success",
    });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});
module.exports = router;
