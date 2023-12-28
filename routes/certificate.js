const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const { sendemail, randomNumber } = require("../utils/myutil");
const router = express.Router();
const prisma = new PrismaClient();
const logger = require("../utils/logger");

router.post("/create", async (req, res) => {
  try {
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
    // get package period
    const package = await prisma.insurancepackage.findFirst({
      where: {
        id: Number(req.body["packageid"]),
      },
    });
    const seq = `000000${sq.seq}`.slice(-6);
    const rand = `${randomNumber(3)}`;
    const no = `${sq.code}-${seq}`;
    let certificate = await prisma.certificate.create({
      data: {
        no: `${no}`,
        user_id: req.user["id"],
        insurancepackage_id: Number(req.body["packageid"]),
        insurancetype_id: Number(req.body["typeid"]),
        type: req.body["type"],
        amount: Number(req.body["amount"]),
        buy_mode: "app",
        expirytime: new Date(
          moment().add(package.period, "M").format("YYYY-MM-DD HH:mm:ss")
        ),
      },
    });
    if (!certificate) {
      return res
        .status(404)
        .send({ result: "NOT_FOUND", message: "Certificate not found" });
    }
    certificate["members"] = [];
    const members = req.body["members"];
    // const members = JSON.parse(req.body["members"]);
    if (members && members.length > 0) {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const cerid = certificate.id;
        const m = await prisma.certificatemember.create({
          data: {
            certificate_id: cerid,
            firstname: member["firstname"],
            lastname: member["lastname"],
            relation: member["relation"] ? member["relation"] : "HEAD",
            gender: member["gender"],
            photo: JSON.stringify({
              passport: member["photopassport"],
              vaccine: member["photovaccine"],
              rtpcr: member["photortpcr"],
            }),
            passport: member["passport"] ? member["passport"] : "-",
            visatype_id: member['visatype_id'] ? member['visatype_id'] : null,
            dob: member ? moment(member["dob"]).toDate() : null,
            seq: `000${i + 1}`.slice(-3),
            phone: member["phone"],
            email: member["email"],
          },
        });
        certificate["members"] = [...certificate["members"], m];
      }
    }
    certificate = await prisma.certificate.findUnique({
      include: {
        insurancepackage: true,
        insurancetype: true,
        certificatemember: true,
        user: true,
      },
      where: {
        id: certificate.id,
      },
    });

    try {
      const url = `https://api.laospt.com/policyschedule?id=${certificate.id}&no=${certificate.no}`;
      const message = `
      Your order of Covid-19 Insurance certificate NO: ${certificate.no} was successful.
      Please read more detail about policy ${url}.
      Please print out the schedule card from this link (${url}) or keep it for payment.
      You can make payment directly from Mobile application LAOPT or at arrival check-in
      
      (Don't forget to make payment of the order first in order to delay check-in to Laos)
      
      Best regards,
      
      Logo  Thavisub insurance broker
      www.laospt.com
      email: laoptapp@gmail.com
      Tel: +856 20 99 117 878
      `;
      sendemail(
        certificate["user"]["email"],
        "Covid-19 Insurance Certificate",
        message
      );
    } catch (error) {
      logger.error("ERROR", error);
    }

    return res.send({
      result: "OK",
      message: "Success",
      certificate: certificate,
    });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

router.get("/get/:no", async (req, res) => {
  let no;
  let params = req.params["no"];
  let noArray = params.split("-");

  if (noArray.length > 2) {
    no = noArray[0] + "-" + noArray[1];
  } else {
    no = params;
  }

  //Get certificate
  let certificate;
  let certificateMember;
  try {
    certificate = await prisma.certificate.findFirst({
      where: {
        no: no,
      },
      include: {
        insurancetype: true,
        insurancepackage: true,
      },
    });
    if (!certificate) {
      logger.error("Couldn't find certificate");
      return res
        .status(500)
        .send({ result: "ERROR", message: "Couldn't find certificate" });
    } else {
      if(noArray.length>2){
        let seq = noArray[2];
        certificateMember =  await prisma.certificatemember.findFirst({
          where:{
            certificate_id: certificate.id,
            seq: seq,
          }
        });

      }
      return res.send({
        certificate: certificate,
        certificate_member: certificateMember,
      });
    }
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ result: "ERROR", message: e.message });
  }
});

module.exports = router;
