const express = require("express");
const router = express.Router();
const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const { randomNumber, sendemail, parsePhone } = require("../utils/myutil");
const { sendsms } = require("../utils/smsutil");
const logger = require("../utils/logger");
const prisma = new PrismaClient();

router.post("/request", async (req, res) => {
  const body = req.body;
  try {
    let user = null;
    let phone = body["phone"];
    if (body["type"] == "phone") {
      phone = parsePhone(body["phone"]);
      user = await prisma.user.findFirst({
        where: {
          phone: phone,
          status: "ACTIVE",
        },
      });
    } else if (body["type"] == "email") {
      user = await prisma.user.findFirst({
        where: {
          email: body["email"],
          status: "ACTIVE",
        },
      });
    }
    if (!user) {
      return res.status(404).send({ result: "NOT_FOUND", message: "Phone or email is incorrect" });
    }
    const otp = randomNumber(4);

    const message = `Your OTP is ${otp}. Please use it for verification.`;
    if (body["type"] == "email") {
      await prisma.otp.create({
        data: {
          email: body.email,
          code: `${otp}`,
          type: body["type"],
        },
      });
      try {
        sendemail(body["email"], "Insurance App Registration - OTP", message, null);
      } catch (error) {
        logger.error("ERROR", error);
      }
    } else if (body["type"] == "phone") {
      await prisma.otp.create({
        data: {
          phone: phone,
          code: `${otp}`,
          type: body["type"],
        },
      });
      try {
        await sendsms(message, phone);
      } catch (error) {
        logger.error("ERROR", error);
      }
    } else {
      return res.status(403).send({
        result: "BAD_REQUST",
        message: "Please provide email or phone number",
      });
    }

    user.password = null;
    user.token = null;

    return res.send(user);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.post("/confirm", async (req, res) => {
  const body = req.body;
  let phone = body["phone"];
  let user = null;
  try {
    if (body["type"] == "phone") {
      phone = parsePhone(phone);
      user = await prisma.user.findFirst({
        where: {
          phone: phone,
          status: "ACTIVE",
        },
      });
    } else if (body["type"] == "email") {
      user = await prisma.user.findFirst({
        where: {
          email: body["email"],
          status: "ACTIVE",
        },
      });
    }
    if (!user) {
      return res.status(404).send({ result: "NOT_FOUND", message: "Username is incorrect" });
    }

    let otp = null;
    if (body["type"] == "phone") {
      otp = await prisma.otp.findFirst({
        where: {
          phone: phone,
          code: body["otp"],
          type: body["type"],
          lastsent: {
            gte: moment().add(-15, "minutes").toDate(),
          },
        },
      });
    } else if (body["type"] == "email") {
      otp = await prisma.otp.findFirst({
        where: {
          email: body["email"],
          type: "email",
          type: body["type"],
          lastsent: {
            gte: moment().add(-15, "minutes").toDate(),
          },
        },
      });
    }
    if (!otp) {
      return res.status(404).send({
        message: "OTP is incorrect or expired",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: body["password"],
      },
    });

    return res.send({ result: "OK", message: "Success" });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});
module.exports = router;
