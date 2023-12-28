const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const { randomNumber, sendemail, parsePhone } = require("../utils/myutil");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { sendsms } = require("../utils/smsutil");
const logger = require("../utils/logger");

router.post("/request", async (request, reply) => {

  try {
    const body = request.body;
    console.log("body:", body)
    const prisma = new PrismaClient();
    let user = null;
    let phone = body["phone"];
    if (body["type"] == "phone") {
      console.log(body['type']);
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
          email: body.email,
          status: "ACTIVE",
        },
      });
    }
    if (user) {
      return reply.status(404).send({
        message: "This phone number or email already exists",
      });
    }
    console.log("user:", user)

    const otp = randomNumber(4);
    await prisma.otp.create({
      data: {
        phone: body["type"] == "phone" ? phone : null,
        email: body["type"] == "email" ? body["email"] : null,
        code: `${otp}`,
        type: body["type"],
      },
    });
    const message = `Your OTP is ${otp}. Please use it for verification.`;
    if (body["type"] == "email" && body["email"]) {
      try {
        sendemail(body["email"], "LAOPT App Registration - OTP", message, null);
      } catch (error) {
        return res.status(403).send({
          result: "BAD_REQUST",
          message: "Cannot send email",
        });
      }
    } else if (body["type"] == "phone") {
      try {
        sendsms(message, phone);
      } catch (error) {
        return res.status(403).send({
          result: "BAD_REQUST",
          message: `Cannot send OTP to the number ${phone}`,
        });
      }
    } else {
      return res.status(403).send({
        result: "BAD_REQUST",
        message: "Cannot send SMS to phone number",
      });
    }
    return reply.send({
      result: "OK",
      message: message,
    });
  } catch (error) {
    return reply.status(500).send({
      result: "ERROR",
      message: error,
    });
  }
});

router.post("/confirmotp", async (request, reply) => {
  const body = request.body;
  const prisma = new PrismaClient();
  //verify otp

  let phone = body["phone"];
  let otp;
  if (body["type"] == "phone") {
    phone = parsePhone(phone);
    otp = await prisma.otp.findFirst({
      where: {
        phone: phone,
        lastsent: {
          gte: moment().add(-15, "minutes").toDate(),
        },
        code: body["otp"],
        type: body["type"],
      },
    });
  } else if (body["type"] == "email") {
    otp = await prisma.otp.findFirst({
      where: {
        email: body["email"],
        lastsent: {
          gte: moment().add(-15, "minutes").toDate(),
        },
        code: body["otp"],
        type: body["type"],
      },
    });
  }

  if (!otp) {
    return reply.status(404).send({
      message: "OTP is incorrect or expired",
    });
  }

  return reply.send({
    message: "OTP is correct",
  });
});

router.post("/confirm", async (request, reply) => {
  const body = request.body;
  console.log("body", body)
  const prisma = new PrismaClient();
  //verify otp
  let otp;
  let phone = body["phone"];
  if (body["type"] == "email") {
    otp = await prisma.otp.findFirst({
      where: {
        email: body["email"],
        type: body["type"],
        code: body["code"],
        lastsent: {
          gte: moment().add(-15, "minutes").toDate(),
        },
      },
    });
  } else if (body["type"] == "phone") {
    phone = parsePhone(phone);
    otp = await prisma.otp.findFirst({
      where: {
        phone: phone,
        type: body["type"],
        code: body["code"],
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

  try {
    console.log("work from home")
    const token = jwt.sign({ phone: phone, email: body["email"] }, process.env.JWT_SECRET);
    body["purpose"] = body["purpose"] == "WORK<30" ? "WORK30" : body["purpose"];
    const user = await prisma.user.create({
      data: {
        phone: body["type"] == "phone" ? phone : null,
        email: body["type"] == "email" ? body["email"] : null,
        password: body["password"],
        firstname: body["firstname"],
        lastname: body["lastname"],
        registerdate: new Date(),
        photo: JSON.stringify({
          photopassport: body["photopassport"],
          photovaccine: body["photovaccine"],
          photortpcr: body["photortpcr"],
        }),
        gender: body["gender"],
        passport: body["passport"],
        visatype_id: body['visatype_id'],
        status: "ACTIVE",
        dob: moment(body["dob"]).toDate(),
        // dob: new Date(body['dob']),
        province_id: body["province_id"],
        token: token,
        idtype: body["idtype"],
        role: "USER",
        purposeofvisit: body["purpose"],
        street: body["street"],
        address: body["address"],
        city: body["city"],
        countrycode: body["countrycode"],
        workplace: body["workplace"],
        resident: body["resident"],
      },
    });
    console.log("user:", user)

    user.password = null;

    try {
      if (body["type"] == "email" && body["email"]) {
        await sendemail(body["email"], "LAOPT - Registration", "Congratulation your registration for LAOPT app was successful");
      }
    } catch (error) { }

    return reply.send(user);
  } catch (error) {
    console.log("console.log:", error)
    logger.error("ERROR", error);
    return reply.status(500).send(error);
  }
});

module.exports = router;
