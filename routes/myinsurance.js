const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const params = {
      include: {
        insurancepackage: true,
        insurancetype: true,
        certificatemember: true,
      },
      where: {
        user_id: Number(req.user["id"]),
      },
      orderBy: {
        createdtime: "desc",
      },
    };
    const status = req.query["status"];
    if (status) {
      params.where["status"] = status;
    }

    let items = await prisma.certificate.findMany(params);
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const item = await prisma.certificate.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        insurancepackage: true,
        insurancetype: true,
      },
    });
    return res.send(item);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/getmembers/:id", async (req, res) => {
  try {
    const items = await prisma.certificatemember.findMany({
      where: {
        certificate_id: Number(req.params.id),
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});
module.exports = router;
