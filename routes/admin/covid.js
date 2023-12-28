const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  randomNumber,
  sendnotification
} = require("../../utils/myutil");
const moment = require("moment");
const logger = require("../../utils/logger");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/certificates", async (req, res) => {
  try {
    const where = {};
    if (req.user.role === "SELLER") {
      where.OR = [
        { servicelocation_id: { equals: Number(req.user.servicelocation_id) } },
        { buy_mode: { equals: 'app' } }
      ];
    }

    const certificates = await prisma.certificate.findMany({
      include: {
        insurancetype: true,
        insurancepackage: true,
        certificatemember: true,
        servicelocation: true,
      },
      where: where,
      orderBy: {
        createdtime: "desc",
      },
    });

    if (!certificates) {
      return res.status(404).send({
        message: `Orders not found`,
      });
    }

    return res.send(certificates);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/customer/:id", async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        insurancepackage: true,
        insurancetype: true,
        certificatemember: true,
      },
      where: {
        user_id: Number(req.params.id),
      },
      orderBy: {
        createdtime: "desc",
      },
    });

    if (!certificates) {
      return res.status(404).send({
        message: `Orders not found`,
      });
    }

    return res.send(certificates);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/info/:no", async (req, res) => {
  try {
    const orderNo = req.params.no;
    const certificate = await prisma.certificate.findUnique({
      where: {
        no: orderNo,
      },
      include: {
        insurancepackage: true,
        insurancetype: true,
        user: true,
      },
    });

    if (!certificate) {
      return res.status(404).send({
        message: `Order #${orderNo} not found`,
      });
    }

    return res.send(certificate);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/find", async (req, res) => {
  const body = req.query
  try {
    const sql = "select c.*, u.firstname, u.lastname, u.phone, u.email\n" +
      "from certificate c\n" +
      "left join user u on c.user_id = u.id\n" +
      `where c.no like '%${body.search}%'\n` +
      `or u.phone like '%${body.search}%'\n` +
      `or u.email like '%${body.search}%'\n` +
      `or lower(u.passport) like lower('%${body.search}%')\n` +
      `or lower(u.firstname) like lower('%${body.search}%')\n` +
      `or lower(u.lastname) like lower('%${body.search}%') order by c.createdtime desc`;
    const certificates = await prisma.$queryRawUnsafe(sql)

    if (!certificates) {
      return res.status(404).send({
        message: `Certificates not found`,
      });
    }

    return res.send(certificates);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/members/:id", async (req, res) => {
  try {
    const members = await prisma.certificatemember.findMany({
      include: {
        certificate: true,
      },
      where: {
        certificate_id: Number(req.params.id),
      },
    });

    if (!members) {
      return res.status(404).send({
        message: `Order ID #${req.params.id} members not found`,
      });
    }

    return res.send(members);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/claims", async (req, res) => {
  try {
    const where = {};
    if (req.user.role === "CLAIMER") {
      where.hospital_id = Number(req.user.hospital_id);
    }
    if (req.user.position === "HEAD") {
      where.status = {
        notIn: ["WAITING", "CANCELLED"],
      };
    }

    const claims = await prisma.claim.findMany({
      include: {
        user: true,
        certificate: true,
        certificatemember: true,
        hospital: true,
      },
      where: where,
      orderBy: {
        reqtime: "desc",
      },
    });

    if (!claims) {
      return res.status(404).send({
        message: `Claims not found`,
      });
    }

    return res.send(claims);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/claim/:id", async (req, res) => {
  try {
    const claim = await prisma.claim.findFirst({
      include: {
        user: true,
        certificate: true,
        hospital: true,
        certificatemember: true,
      },
      where: {
        id: Number(req.params.id),
      },
    });

    if (!claim) {
      return res.status(404).send({
        message: `Claim not found`,
      });
    }

    if (claim.employee_id) {
      claim.employee = await prisma.user.findFirst({
        where: {
          id: claim.employee_id,
        },
      });
    }

    return res.send(claim);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/claim/history/:id/:member", async (req, res) => {
  try {
    const member = Number(req.params.member)
    const wheres = {
      certificate_id: Number(req.params.id),
    }
    if (member !== 0) wheres.certificatemember_id = member
    const claims = await prisma.claim.findMany({
      include: {
        certificatemember: true,
      },
      where: wheres,
    });

    if (!claims) {
      return res.status(404).send({
        message: `Order ID #${req.params.id} claim histories not found`,
      });
    }

    return res.send(claims);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/certificate/payment/history/:id", async (req, res) => {
  try {
    let sql = `select p.*, concat(u.firstname, ' ', u.lastname) employee from payment p 
           left join user u on u.id = p.employee_id
           where p.certificate_id = ${Number(req.params.id)}`
    const payments = await prisma.$queryRawUnsafe(sql)
    if (!payments) {
      return res.status(404).send({
        message: `Order ID #${req.params.id} payment histories not found`,
      });
    }

    return res.send(payments);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.post("/buy", async (req, res) => {
  try {
    // create certificate seq
    let sq = await prisma.certificatesequence.findFirst({
      where: {
        code: moment().format("YYYYMM"),
      },
    });
    if (!sq) {
      sq = await prisma.certificatesequence.create({
        data: {
          code: moment().format("YYYYMM"),
          seq: 1,
        },
      });
    } else {
      sq = await prisma.certificatesequence.update({
        where: {
          id: sq.id,
        },
        data: {
          seq: sq.seq + 1,
        },
      });
    }
    const seq = `000000${sq.seq}`.slice(-6);
    const rand = `${randomNumber(3)}`;
    const no = `${sq.code}-${seq}`;

    // create certificate
    let certificate = await prisma.certificate.create({
      data: {
        no: `${no}`,
        user_id: req.body["userId"],
        employee_id: req.user["id"],
        insurancetype_id: Number(req.body["insuranceType"]),
        insurancepackage_id: Number(req.body["package"]),
        type: req.body["buyType"].toUpperCase(),
        amount: Number(req.body["amount"]),
        servicelocation_id: req.user.servicelocation_id,
        buy_mode: "web",
        expirytime: new Date(moment().add(req.body.period, 'M').format("YYYY-MM-DD HH:mm:ss")),
      },
    });

    if (!certificate) {
      return res
        .status(404)
        .send({
          result: "NOT_FOUND",
          message: "Create certificate failed, Please try again",
        });
    }

    // add member
    const members = req.body["family"];
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      await prisma.certificatemember.create({
        data: {
          certificate_id: certificate.id,
          firstname: member["firstname"],
          lastname: member["lastname"],
          phone: member["phone"] ? member["phone"] : null,
          email: member["email"] ? member["email"] : null,
          relation: member["relation"],
          gender: member["gender"],
          photo: JSON.stringify(member["photo"]),
          passport: member["passport"] ? member["passport"] : "-",
          dob: member ? new Date(member["dob"].split('/').reverse().join('-')) : null,
          countrycode: member["country"],
          province_id: Number(member["province"]),
          workplace: member && member["placeOfWork"] ? member["placeOfWork"] : null,
          seq: `000${i + 1}`.slice(-3),
          visatype_id: member['visatype_id'] ? member['visatype_id'] : null,

        },
      });
    }

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: req.body["userId"]
      },
    })
    sendnotification(customer, no, 'buy', true)

    return res.send({
      result: "OK",
      message: "Success",
      no,
    });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/order/cancel/:id", async (req, res) => {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        no: req.params.id,
        status: "PENDING",
      },
    });

    if (!certificate) {
      return res
        .status(404)
        .send({ result: "NOT_FOUND", message: "Certificate not found" });
    }

    await prisma.certificate.update({
      data: {
        status: "CANCELLED",
      },
      where: {
        no: certificate.no,
      },
    });

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/pay", async (req, res) => {
  const body = req.body;
  try {
    // check existed certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        no: body.certificateNo,
        amount: Number(body.total),
        status: "PENDING",
      },
      include: {
        user: true,
      },
    });
    if (!certificate) {
      return res.status(404).send({
        message: "Certificate not found",
      });
    }

    await prisma.certificate.update({
      data: {
        status: "PAID",
      },
      where: {
        id: certificate.id,
      },
    });

    await prisma.payment.create({
      data: {
        createdtime: new Date(),
        certificate_id: certificate.id,
        user_id: certificate.user_id,
        employee_id: req.user.id,
        channel: body.paymentMethod,
        rawresponse: body,
      },
    });

    // sending notification
    sendnotification(certificate.user, certificate.no, 'pay', true)

    return res.send({
      result: "OK",
      message: "Payment Success",
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim", async (req, res) => {
  const body = req.body;
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: Number(body.certificateId),
      },
      include: {
        user: true,
      },
    });
    if (!certificate) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Certificate not found",
      });
    }
    const claim = await prisma.claim.create({
      data: {
        status: "WAITING",
        certificate_id: certificate.id,
        user_id: body.userId,
        employee_id: req.user.id,
        type: body.purpose,
        amount: body.amount,
        hospital_id: req.user.hospital_id,
        certificatemember_id: body.member,
        photo: body.photo,
        claim_mode: "web",
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "WAITING",
        remark: "Staff request claim",
        claim_id: claim.id,
        user_id: req.user.id,
      },
    });

    // sending notification
    sendnotification(certificate.user, certificate.no, 'claim', true)

    return res.send({
      result: "OK",
      message: "Success",
      claim: claim,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/approve", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
      include: {
        certificate: true,
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (claim.status !== "PROCESSING") {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to claim",
      });
    }
    const approved = await prisma.claim.update({
      data: {
        status: "APPROVED",
        approveddate: new Date(),
        approvedby: req.user.id,
      },
      where: {
        id: body.claimId,
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "APPROVED",
        remark: body.description,
        claim_id: body.claimId,
        user_id: req.user.id,
      },
    });

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: claim.certificate.user_id
      },
    })
    sendnotification(customer, claim.certificate.no, 'claim', true, 'APPROVED')

    return res.send({
      result: "OK",
      message: "Success",
      claim: claim,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/complete", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
      include: {
        certificate: true,
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (claim.status !== "APPROVED") {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to complete",
      });
    }
    await prisma.claim.update({
      data: {
        status: "CLOSED",
      },
      where: {
        id: Number(body.claimId),
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "CLOSED",
        remark: body.description,
        claim_id: Number(body.claimId),
        user_id: req.user.id,
      },
    });

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: claim.certificate.user_id
      },
    })
    sendnotification(customer, claim.certificate.no, 'claim', true, 'CLOSED')

    return res.send({
      result: "OK",
      message: "Success"
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/edit", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (!["WAITING", 'PROCESSING'].includes(claim.status)) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to edit",
      });
    }
    await prisma.claim.update({
      data: {
        type: body.purpose,
        certificatemember_id: Number(body.member),
        amount: Number(body.amount),
      },
      where: {
        id: Number(body.claimId),
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "UPDATE",
        remark: "Update claim details",
        claim_id: Number(body.claimId),
        user_id: req.user.id,
        request_body: body,
      },
    });
    return res.send({
      result: "OK",
      message: "Success"
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/confirm", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
      include: {
        certificate: true,
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (claim.status !== "WAITING") {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to confirm",
      });
    }
    await prisma.claim.update({
      data: {
        status: "PROCESSING",
      },
      where: {
        id: Number(body.claimId),
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "PROCESSING",
        remark: body.description,
        claim_id: Number(body.claimId),
        user_id: req.user.id,
      },
    });

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: claim.certificate.user_id
      },
    })
    sendnotification(customer, claim.certificate.no, 'claim', true, 'PROCESSING')

    return res.send({
      result: "OK",
      message: "Success"
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/cancel", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
      include: {
        certificate: true,
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (claim.status !== "WAITING") {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to cancel",
      });
    }
    await prisma.claim.update({
      data: {
        status: "CANCELLED",
      },
      where: {
        id: Number(body.claimId),
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "CANCELLED",
        remark: body.description,
        claim_id: Number(body.claimId),
        user_id: req.user.id,
      },
    });

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: claim.certificate.user_id
      },
    })
    sendnotification(customer, claim.certificate.no, 'claim', true, 'CANCELLED')

    return res.send({
      result: "OK",
      message: "Success"
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/reject", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
      include: {
        certificate: true,
      },
    });
    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    if (claim.status !== "PROCESSING") {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim request not ready to reject",
      });
    }
    const approved = await prisma.claim.update({
      data: {
        status: "REJECTED",
      },
      where: {
        id: body.claimId,
      },
    });
    await prisma.claimlog.create({
      data: {
        status: "REJECTED",
        remark: body.description,
        claim_id: body.claimId,
        user_id: req.user.id,
      },
    });

    // sending notification
    const customer = await prisma.user.findFirst({
      where: {
        id: claim.certificate.user_id
      },
    })
    sendnotification(customer, claim.certificate.no, 'claim', true, 'REJECTED')

    return res.send({
      result: "OK",
      message: "Success",
      claim: claim,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.post("/claim/comment", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
    });

    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    await prisma.claimlog.create({
      data: {
        status: "COMMENT",
        remark: body.message,
        claim_id: body.claimId,
        user_id: req.user.id,
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

router.post("/claim/updatephoto", async (req, res) => {
  const body = req.body;
  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: Number(body.claimId),
      },
    });

    if (!claim) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim not found",
      });
    }

    await prisma.claim.update({
      data: {
        photo: body.photos,
      },
      where: {
        id: Number(body.claimId),
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

router.post("/claim/logs", async (req, res) => {
  const body = req.body;
  try {
    const logs = await prisma.claimlog.findMany({
      include: {
        user: true,
      },
      where: {
        claim_id: Number(body.claimId),
        status: body.status,
      },
    });
    if (!logs) {
      return res.status(404).send({
        result: "NOT_FOUND",
        message: "Claim logs not found",
      });
    }

    res.send(logs);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

module.exports = router;
