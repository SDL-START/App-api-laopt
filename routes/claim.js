const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

router.get("/gets", async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: {
        user_id: Number(req.user["id"]),
      },
      orderBy: {
        reqtime: "desc",
      },
      include: {
        certificate: true,
        certificatemember: true,
      },
    });
    return res.send(claims);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(req.params["id"]),
        user_id: Number(req.user["id"]),
      },
    });
    if (!claim) {
      return res.status(404).send({ result: "ERROR", message: "Claim not found" });
    }
    return res.send(claim);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.get("/getlogs/:id", async (req, res) => {
  try {
    const items = await prisma.claimlog.findMany({
      where: {
        claim_id: Number(req.params["id"]),
      },
    });
    if (!items) {
      return res.status(404).send({ result: "ERROR", message: "Claim not found" });
    }
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/request", async (req, res) => {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: Number(req.body["certificateid"]),
        user_id: Number(req.user["id"]),
      },
      include: {
        certificatemember: true,
      },
    });
    if (!certificate) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Certificate not found",
      });
    }
    // if (certificate.status != "PAID") {
    //   return res.status(404).send({
    //     result: "CERTIFICATE_NOT_PAID",
    //     message: "Certificate not been paid",
    //   });
    // }
    const claim = await prisma.claim.create({
      data: {
        status: "WAITING",
        certificate_id: certificate.id,
        user_id: req.user["id"],
        type: req.body["type"],
        amount: req.body["amount"],
        hospital_id: req.body["hospitalid"] ? Number(req.body["hospitalid"]) : null,
        photo: req.body["photo"],
        certificatemember_id: req.body["certificatememberid"] ? Number(req.body["certificatememberid"]) : certificate.certificatemember[0].id,
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "WAITING",
        remark: "User request claim",
        claim_id: claim.id,
      },
    });
    return res.send({
      result: "OK",
      message: "Success",
      claim: claim,
    });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});
module.exports = router;
