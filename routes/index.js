const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const { sendemail, sendpushtotopic, parsePhone } = require("../utils/myutil");
const { payCode } = require("../utils/onepay");
const { sendsms } = require("../utils/smsutil");
const router = express.Router();
const prisma = new PrismaClient();
const logger = require("../utils/logger");

router.get("", async (req, res) => {
  try {
    return res.send({
      message: "ok",
    });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/countries", async (req, res) => {
  try {
    const items = await prisma.country.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/provinces", async (req, res) => {
  try {
    const items = await prisma.province.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/districts", async (req, res) => {
  try {
    const items = await prisma.district.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/claimtypes", async (req, res) => {
  try {
    const items = [
      { value: "medicine", name: "Medicine" },
      { value: "checkup", name: "Checkup" },
      // { value: "death", name: "Death" },
    ];
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/hospitals", async (req, res) => {
  try {
    const items = await prisma.$queryRaw`select id,
                                                name,
                                                address,
                                                tel,
                                                hospitaltype,
                                                lat,
                                                lng,
                                                images
                                         from hospital
                                         where lat !='' and lng !='' and deleted = 0
    `;
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/services", async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
        select id,
               name,
               address,
               tel,
               'UNIT',
               lat,
               lng,
               images
        from servicelocation
        where lat !='' and lng !=''
    and deleted=0
    `;
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/hospitalsandservices", async (req, res) => {
  try {
    const items = await prisma.$queryRaw`select id,
                                                name,
                                                address,
                                                tel,
                                                hospitaltype,
                                                lat,
                                                lng,
                                                images,
                                                '1' type
                                         from hospital
                                         where lat !='' and lng !='' and deleted=0

                                         union all

    select id,
           name,
           address,
           tel,
           'UNIT',
           lat,
           lng,
           images,
           '2' type
    from servicelocation
    where lat !='' and lng !=''
    and deleted=0
    `;
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});


router.get("/relations", async (req, res) => {
  try {
    const items = [
      { value: "COUPLE", name: { us: "Couple" } },
      { value: "CHILDREN", name: { us: "Children" } },
      { value: "PARENTS", name: { us: "Parents" } },
      { value: "FRIENDS", name: { us: "Friend" } },
      { value: "OTHER", name: { us: "Other" } },
    ];
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.post("/sms", async (req, res) => {
  try {
    const phone = parsePhone(req.body["phone"]);
    const r = await sendsms(req.body["message"], phone);
    return res.send(r);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send(e);
  }
});

router.post("/email", async (req, res) => {
  try {
    const r = await sendemail(req.body["to"], req.body["subject"], req.body["message"], null);
    return res.send(r);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send(e);
  }
});

router.get("/payment/:certificateid", async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: {
        id: Number(req.params.certificateid),
      },
    });
    if (!certificate) {
      return res.status(404).send({ message: "Not found" });
    }
    return res.render("payment", {
      certificate: certificate,
    });
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, error: error });
  }
});

router.get("/purposes", async (req, res) => {
  try {
    return res.send([
      { code: "TOUR", name: { us: "Tour", la: "ທ່ອງທ່ຽວ" } },
      { code: "WORK30", name: { us: "Work (<30 Days)", la: "ເຮັດວຽກ (<30 ວັນ)" } },
      { code: "WORK", name: { us: "Work (>=30 Days)", la: "ເຮັດວຽກ (>=30 ວັນ)" } },
    ]);
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, e: e });
  }
});

router.post("/qronepay", async (req, res) => {
  try {
    const params = {
      amount: req.body.amount,
      invoiceid: req.body.invoiceid,
      transactionid: req.body.transactionid,
      terminalid: req.body.terminalid,
      description: req.body.description,
    };
    const qr = payCode(params);
    logger.debug("QR", qr);
    return res.send(qr);
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, e: e });
  }
});

router.get("/qronepay/:id/:amount", async (req, res) => {
  try {
    const params = {
      amount: req.params["amount"],
      invoiceid: `${req.params["id"]}`,
      transactionid: `${req.params["id"]}`,
      terminalid: `1`,
      description: `LaoPT-Insurance-Payment-No:${req.params["id"]}`,
    };
    logger.debug("QRONEPAYPARAMS", params);
    const qr = payCode(params);
    logger.debug("QR", qr);
    return res.send({
      qrstring: qr,
      url: `onepay://qr://${qr}`,
    });
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, e: error });
  }
});

router.get("/qrldbtrustpay/:id/:amount/:uuid", async (req, res) => {
  const ldb = {
    username: "INSEE",
    password: "4s2doGPy&gb0adbK*Jk8",
    grant_type: "client_credentials",
    authService: null,
  };
  let pay_status = false;
  let ldb_token = null;
  let mchId = "LDB0302000022";
  let mchRef = `${Math.floor(100000 + Math.random() * 900000)}`;
  let desc = "insee test";
  let linkBack = "https://wallet.inseehub.digital";
  let additional = "TRUST-TEST-XXX";
  let qr_data = null;
  let link_data = null;

  try {
    const url = `https://dehome.ldblao.la/ldbpay/v1/authService/token?grant_type=${ldb.grant_type}`;
    const resToken = await axios.post(
      url,
      {},
      {
        auth: {
          username: ldb.username,
          password: ldb.password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (resToken && resToken.status === 200) {
      ldb.authService = resToken.data;
    }

    const data = {
      merchId: mchId,
      merchRef: mchRef,
      amount: parseInt(req.params["amount"]),
      additional: additional,
      urlBack: linkBack,
      urlCallBack: `https://wallet.inseehub.digital/bank/callback/?status=success`,
      remark: desc,
    };
    const resPay = await axios.post("https://dehome.ldblao.la/ldbpay/v1/payment/getLink.service", data, {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + ldb.authService.access_token,
      },
    });
    if (resPay.data.status == "00") {
      qr_data = resPay.data.dataResponse.qr;
      link_data = resPay.data.dataResponse.link;
      try {
        window.launch.postMessage(link_data);
      } catch (err) {
        logger.error("ERROR CANNOT LAUNCH LDB APP", err);
      }
      setInterval(() => {
        const dataBody = {
          merchId: mchId,
          refNumber: mchRef,
        };

        axios
          .post("https://dehome.ldblao.la/ldbpay/v1/payment/enquiry.service", dataBody, {
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + ldb_token,
            },
          })
          .then((response) => {
            logger.debug("Check Call Back", response.data);
            if (response.statusCode == 200 && response.data.status == "00") {
              pay_status = true;
            } else {
              pay_status = false;
            }
          });
      }, 5000);
    }
    return res.send({
      qrstring: qr,
      url: `onepay://qr/${qr}`,
    });
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, e: error });
  }
});

router.get("/paymentsuccess", async (req, res) => {
  try {
    return res.redirect("/paymentsuccess.html");
  } catch (error) {
    logger.error("ERROR", error);
    return res.status(500).send({ message: error.message, e: e });
  }
});

router.get("/pushtopic", async (req, res) => {
  try {
    sendpushtotopic("hello", "body", { topic: "test", message: "test" });
    return res.json({ message: "OK" });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/policyschedule", async (req, res) => {
  try {
    const id = Number(req.query.id);
    const no = req.query.no;
    const memberseq = req.query.member;
    const lang = req.query.lang ? req.query.lang : "us";
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: id,
        no: no,
      },
      include: {
        user: true,
        insurancepackage: true,
      },
    });
    if (!certificate) {
      return res.status(404).send({ message: "Certificate not found" });
    }
    let member = null
    if (memberseq) {
      member = await prisma.certificatemember.findFirst({
        where: {
          certificate_id: id,
          seq: memberseq,
        }
      });
      member["dob"] = moment(member["dob"]).format("DD/MM/YYYY");
    }
    // if (certificate.status !== "PAID") {
    //   return res.status(400).send({ message: "Certificate status incorrect" });
    // }
    certificate["user"]["dob"] = moment(certificate["user"]["dob"]).format("DD/MM/YYYY");
    const createdtime = certificate["createdtime"];
    const expirytime = certificate["expirytime"];
    certificate["expirymonth"] = Math.round(moment(expirytime).diff(moment(createdtime), 'months', true))
    certificate["createdtime"] = moment(createdtime).format("DD/MM/YYYY");
    certificate["expiredtime"] = moment(expirytime).format("DD/MM/YYYY");

    member["phone"] = member["phone"] ?? certificate["user"]["phone"];
    member["email"] = member["email"] ?? certificate["user"]["email"];
    member["countrycode"] = member["countrycode"] ?? certificate["user"]["countrycode"];
    //return res.render(`policyschedule-${lang}`, { certificate: certificate });
    return res.render(`policyschedule`, { certificate, member });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/invoice", async (req, res) => {
  try {
    const id = Number(req.query.id);
    const no = req.query.no;
    const memberseq = req.query.member;
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: id,
        no: no,
      },
      include: {
        user: true,
        certificatemember: true,
        insurancepackage: true,
        payment: true,
      },
    });
    if (!certificate) {
      return res.status(404).send({ message: "Certificate not found" });
    }
    let member = null
    if (memberseq) {
      member = await prisma.certificatemember.findFirst({
        where: {
          certificate_id: id,
          seq: memberseq,
        }
      });
      member["dob"] = moment(member["dob"]).format("DD/MM/YYYY");
    }
    const createdtime = certificate["createdtime"];
    const expirytime = certificate["expirytime"];
    certificate["expirymonth"] = Math.round(moment(expirytime).diff(moment(createdtime), 'months', true))
    certificate["createdtime"] = moment(createdtime).format("DD/MM/YYYY");
    certificate["expiredtime"] = moment(expirytime).format("DD/MM/YYYY");

    return res.render(`invoice`, { certificate, member });
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/testseq", async (req, res) => {
  const max = await prisma.certificatesequence.findFirst({
    where: {
      code: moment().format("YYYYMM"),
    },
    orderBy: {
      createdtime: "desc",
    },
  });

  const sq = await prisma.certificatesequence.create({
    data: {
      code: moment().format("YYYYMM"),
      seq: `${max ? max.seq * 1 + 1 : 1}`,
    },
  });

  return res.json({
    max: max,
    sq: sq,
  });
});


router.get("/updatememberseq", async (req, res) => {
  const certs = await prisma.certificate.findMany();
  console.log(certs.length);
  for (let i = 0; i < certs.length; i++) {
    const cert = certs[i];
    const members = await prisma.certificatemember.findMany({
      where: {
        certificate_id: cert.id
      }
    });
    console.log(cert.id);
    console.log(members.length);
    for (let a = 0; a < members.length; a++) {
      const member = members[a];
      await prisma.certificatemember.update({
        data: {
          seq: `000${a + 1}`.slice(-3)
        },
        where: {
          id: member.id
        }
      })
    }
  }
})

module.exports = router;
