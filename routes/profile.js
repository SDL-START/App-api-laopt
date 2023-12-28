const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const { randomNumber, sendemail, parsePhone } = require("../utils/myutil");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { sendsms } = require("../utils/smsutil");
const logger = require("../utils/logger");

router.post("/request", async (request, reply) => {
  const body = request.body;
  const prisma = new PrismaClient();
  let user = await prisma.user.findFirst({
    where: {
      id: req.user["id"],
      status: "ACTIVE",
    },
  });
  if (!user) {
    return reply.status(404).send({
      message: "User Not Found",
    });
  }

  const otp = randomNumber(4);
  const otp_expiry = new Date();
  otp_expiry.setMinutes(otp_expiry.getMinutes() + 5);
  const otp_expiry_timestamp = otp_expiry.getTime();
  const otp_insert = await prisma.otp.create({
    data: {
      phone: body.phone,
      email: body.email,
      code: `${otp}`,
    },
  });
  const message = `Your OTP is ${otp}. Please use it for verification.`;
  if (body["email"]) {
    try {
      await sendemail(body["email"], "Insurance App Registration - OTP", message, null);
    } catch (error) {
      logger.error("ERROR", error);
    }
  } else if (body["phone"]) {
    try {
      const phone = parsePhone(req.body["phone"]);
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
  return reply.status(200).send({
    message: message,
  });
});

router.post("/confirmotp", async (request, reply) => {
  const body = request.body;
  const prisma = new PrismaClient();
  //verify otp
  let otp;
  if (body["type"] == "email") {
    otp = await prisma.otp.findFirst({
      where: {
        email: body["email"],
        type: body["type"],
        code: body["otp"],
        lastsent: {
          gte: moment().add(-15, "minutes").toDate(),
        },
      },
    });
  } else if (body["type"] == "phone") {
    const phone = parsePhone(body["phone"]);
    otp = await prisma.otp.findFirst({
      where: {
        phone: phone,
        type: body["type"],
        code: body["otp"],
        lastsent: {
          gte: moment().add(-15, "minutes").toDate(),
        },
      },
    });
  }
  if (!otp) {
    return reply.status(404).send({
      message: "OTP is incorrect or expired",
    });
  }
  return reply.send({
    result: "OK",
    message: "OTP is correct",
  });
});

router.post("/confirm", async (request, reply) => {
  const body = request.body;
  const prisma = new PrismaClient();
  //verify otp
  // const otp = await prisma.otp.findFirst({
  //   where: {
  //     OR: [{ phone: body.phone }, { email: body.email }],
  //     code: body.otp,
  //     lastsent: {
  //       gte: moment().add(-25, "minutes").toDate(),
  //     },
  //   },
  // });
  // if (!otp) {
  //   return reply.status(404).send({
  //     message: "OTP is incorrect or expired",
  //   });
  // }

  try {
    body["phone"] = parsePhone(body["phone"]);
    const token = jwt.sign({ phone: body["phone"], email: body["email"] }, process.env.JWT_SECRET);
    body["province_id"] = Number(body["province_id"]);
    const user = await prisma.user.update({
      data: {
        phone: body["phone"],
        firstname: body["firstname"],
        lastname: body["lastname"],
        registerdate: new Date(),
        photo: body["photo"],
        gender: body["gender"],
        passport: body["passport"],
        status: "ACTIVE",
        dob: moment(body["dob"]).toDate(),
        email: body["email"],
        province_id: Number(body["province_id"]),
        token: token,
        idtype: body["idtype"],
        role: "USER",
        purposeofvisit: body["purpose"],
        workplace: body["workplace"],
        resident: body["resident"],
        street: body["street"],
        address: body["address"],
        city: body["city"],
        countrycode: body["countrycode"],
      },
      where: {
        id: Number(body["id"]),
      },
    });

    user.password = null;
    return reply.send(user);
  } catch (error) {
    logger.error("ERROR", error);
    return reply.status(500).send(error);
  }
});

router.post("/delete", async (request, reply) => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.update({
      data: {
        status: "CLOSED",
      },
      where: {
        id: Number(request.user["id"]),
      },
    });

    return reply.send(user);
  } catch (error) {
    logger.error("ERROR", error);
    return reply.status(500).send(error);
  }
});

module.exports = router;
