const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

router.post("", async (req, res) => {
  const body = req.body; 
  const loginType = body.type;
  const appRole = ["USER", "STAFF"];
  const portalRole = ["ADMIN", "SELLER", "CLAIMER", 'ACCOUNTING'];
  let role = "USER";
  if (loginType && loginType === "admin") role = "ADMIN";
  body["username"] = body["username"]?.trim();
  if (body["username"]?.startsWith("00")) {
    body["username"] = `+${body["username"].substr(2)}`;
  }
  if (body["username"]?.indexOf("@laopt.com") >= 0 || body["username"]?.indexOf("@laospt.com") >= 0) role = "STAFF";
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.username }, { phone: body.username }],
        password: body.password,
      },
    });
    if (!user) {
      return res.status(404).send({ result: "NOT_FOUND", message: "Username or password is incorrect" });
    }
    if ((appRole.includes(user.role) && !appRole.includes(role)) || (portalRole.includes(user.role) && !portalRole.includes(role))) {
      return res.status(404).send({ result: "NOT_FOUND", message: "You don't have permission to access" });
    }
    if (user.status !== "ACTIVE") {
      return res.status(404).send({ result: "STATUS_NOT_ALLOWED", message: "User status is " + user.status });
    }
    user.password = null;
    const options = {};
    if (role !== "USER") {
      options.expiresIn = "8h";
    }
    const t = {
      id: user.id,
      phone: user.phone,
      firstname: user.firstname,
      lastname: user.lastname,
      photo: user.photo,
      gender: user.gender,
      passport: user.passport,
      status: user.status,
      dob: user.dob,
      email: user.email,
      province_id: user.province_id,
      idtype: user.idtype,
      role: user.role,
      purposeofvisit: user.purposeofvisit,
      resident: user.resident,
      workplace: user.workplace,
      street: user.street,
      city: user.city,
      countrycode: user.countrycode,
      position: user.position,
      servicelocation_id: user.servicelocation_id,
      hospital_id: user.hospital_id,
    }
    user.token = jwt.sign(t, process.env.JWT_SECRET, options);
    try {
      await prisma.user.update({
        data: {
          firebasetoken: body["firebasetoken"],
        },
        where: {
          id: user.id,
        },
      });
    } catch (error) {
      logger.error("ERROR", error);
    }

    return res.send(user);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
