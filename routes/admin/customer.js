const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const logger = require("../../utils/logger");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    /*let customers = await prisma.user.findMany({
      where: {
        role: {in: ['USER', 'STAFF']},
      },
    });*/

    const customers = await prisma.$queryRaw`select *
                                             from user
                                             where role in ('USER')
                                             order by registerdate desc`;

    if (!customers) {
      return res.status(404).send({
        message: "Customers not found",
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
      customers,
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  const customerId = req.params.id;
  try {
    let user = await prisma.user.findFirst({
      include: {
        province: true,
        servicelocation: true,
        user: true,
      },
      where: {
        id: Number(customerId),
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "User Not Found",
      });
    }

    return res.send(user);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/create", async (req, res) => {
  const body = req.body;
  try {
    if (!req.user.servicelocation_id) {
      return res.status(404).send({
        message: "Your user have no service location, Please contact Admin.",
      });
    }

    let user = null;
    if (body["registerBy"] === "phone") {
      user = await prisma.user.findFirst({
        where: {
          phone: body.phone,
        },
      });
    } else if (body["registerBy"] === "email") {
      user = await prisma.user.findFirst({
        where: {
          email: body.email,
        },
      });
    }
    if (user) {
      return res.status(404).send({
        message: "This phone number or email already exists",
      });
    }

    //check exited passport number
    user = await prisma.user.findFirst({
      where: {
        passport: body.passport,
      },
    });

    if (user) {
      return res.status(404).send({
        message: "Passport number already exists",
      });
    }

    const craeted = await prisma.user.create({
      data: {
        phone: !body["phone"] || body["phone"] === "" ? null : body["phone"],
        password: "123456", //TODO: gen password and send to customer via phone or email as register option
        firstname: body["firstname"],
        lastname: body["lastname"],
        registerdate: new Date(),
        photo: JSON.stringify(body["photo"]),
        gender: body["gender"],
        passport: body["passport"],
        status: "ACTIVE",
        dob: new Date(body["dob"].split('/').reverse().join('-')),
        email: !body["email"] || body["email"] === "" ? null : body["email"],
        province_id: Number(body["province"]),
        idtype: "PASSPORT",
        role: "USER",
        purposeofvisit: body["purposeOfVisit"],
        //street: body["street"],
        address: body["address"],
        city: body["city"],
        countrycode: body["country"],
        workplace: body["placeOfWork"],
        register_mode: 'web',
        servicelocation_id: Number(req.user.servicelocation_id),
        employee_id: Number(req.user.id),
        visatype_id: body['visatype_id'],

        //resident: body["resident"],
      },
    });

    return res.send(craeted);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/update", async (req, res) => {
  const body = req.body;
  try {
    const customer = await prisma.user.findFirst({
      where: {
        id: Number(body.customerid),
      },
    });
    if (!customer) {
      return res.status(404).send({
        message: "Customer not found",
      });
    }

    const updated = await prisma.user.update({
      data: {
        status: body.status,
        firstname: body.firstname,
        lastname: body.lastname,
        phone: body.phone ? body.phone : null,
        email: body.email ? body.email : null,
        passport: body.passport,
        dob: new Date(body.dob.split('/').reverse().join('-')),
        gender: body.gender,
        countrycode: body.country,
        city: body.city,
        province_id: isNaN(Number(body.province)) ? Number(body.province.id) : Number(body.province),
        address: body.address,
        purposeofvisit: body.purposeOfVisit,
        workplace: body.placeOfWork,
        photo: JSON.stringify(body.photo),
      },
      where: {
        id: customer.id,
      },
    });

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/member/update", async (req, res) => {
  const body = req.body;
  try {
    await prisma.certificatemember.update({
      data: {
        firstname: body["firstname"],
        lastname: body["lastname"],
        relation: body["relation"],
        gender: body["gender"],
        photo: JSON.stringify(body["photo"]),
        passport: body["passport"] ? body["passport"] : "-",
        dob: new Date(body["dob"]),
        countrycode: body["country"],
        province_id: Number(body["province"]),
        workplace: body && body["placeOfWork"] ? body["placeOfWork"] : null,
      },
      where: {
        id: body.id,
      },
    });

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

module.exports = router;
