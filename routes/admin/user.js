const express = require("express");
const { PrismaClient } = require("@prisma/client");
const moment = require("moment/moment");
const logger = require("../../utils/logger");
const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    /*let users = await prisma.user.findMany({
      where: {
        OR: [{role: 'ADMIN'}, {role: 'SELLER'}, {role: 'CLAIMER'}],
      },
    });*/

    const users = await prisma.$queryRaw`select u.*, h.name hospital_name, s.name servicelocation_name
                                         from user u
                                                  left join hospital h on h.id = u.hospital_id
                                                  left join servicelocation s on s.id = u.servicelocation_id
                                         where u.role in ('ADMIN', 'SELLER', 'CLAIMER', 'STAFF', 'ACCOUNTING')
                                         order by u.registerdate desc`;

    if (!users) {
      return res.status(404).send({
        message: "Users not found",
      });
    }

    return res.send(users);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/view/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    let user = await prisma.user.findFirst({
      include: {
        hospital: true,
        servicelocation: true,
      },
      where: {
        id: Number(userId),
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

router.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        isactive: 1,
      },
    });
    return res.send(roles);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/create", async (req, res) => {
  const body = req.body;
  try {
    let user = null;
    user = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.username }, { phone: body.username }, { phone: body.phone }],
      },
    });
    if (user) {
      return res.status(404).send({
        message: "This phone number already exists",
      });
    }

    const created = await prisma.user.create({
      data: {
        firstname: body["firstname"],
        lastname: body["lastname"],
        phone: body["phone"],
        gender: body["gender"],
        dob: moment(body["dob"]).toDate(),
        position: body["position"],
        hospital_id: body["hospital"] === "" ? null : body["hospital"],
        servicelocation_id: body["serviceLocation"] === "" ? null : body["serviceLocation"],
        role: body["role"],
        email: body["username"],
        password: body["password"],
        registerdate: new Date(),
        status: body["status"],
        idtype: "PASSPORT",
        visatype_id: body['visatype_id'],
      },
    });

    return res.send(created);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.put('', async (req, res) => {
  const body = req.body

  try {
    const updated = await prisma.user.update({
      data: {
        firstname: body.firstname,
        lastname: body.lastname,
        role: body.role,
        status: body.status,
        hospital_id: body.hospital ? Number(body.hospital) : null,
        servicelocation_id: body.serviceLocation ? Number(body.serviceLocation) : null,
      },
      where: {
        id: Number(body.id),
      },
    });

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const updated = await prisma.user.update({
      data: {
        status: 'CLOSED',
      },
      where: {
        id: Number(userId),
      },
    });

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.post("/changepassword", async (req, res) => {
  const body = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(body.userid),
        password: body.currentPassword,
      },
    });
    if (!user) {
      return res.status(404).send({
        message: "Current password incorrect!",
      });
    }

    const updated = await prisma.user.update({
      data: {
        password: body.newPassword,
      },
      where: {
        id: user.id,
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
