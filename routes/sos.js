const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const { sendpushtofirebasetoken } = require("../utils/myutil");
const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.sos.findFirst({
      where: {
        userid: req.user["id"],
      },
      orderBy: {
        senttime: "desc",
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/get/:id", async (req, res) => {
  const id = req.params.id; // getfrom token
  try {
    const item = await prisma.sos.findFirst({
      where: {
        id: Number(id),
        userid: req.user["id"],
      },
    });
    if (!item) {
      return res.send({});
    }
    return res.send(item);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/getlogs/:id", async (req, res) => {
  const id = req.params.id; // getfrom token
  try {
    const items = await prisma.soslog.findMany({
      where: {
        id: Number(id),
      },
      orderBy: {
        txtime: "desc",
      },
    });
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.post("/location", async (req, res) => {
  try {
    const body = req.body;
    const userid = req.user["id"];
    let sos = await prisma.sos.findFirst({
      where: {
        userid: userid,
        status: "PENDING",
      },
    });
    if (!sos) {
      sos = await prisma.sos.create({
        data: {
          lat: body["lat"],
          lng: body["lng"],
          acc: body["accuracy"],
          userid: userid,
        },
      });
      sos["log"] = await prisma.soslog.create({
        data: {
          txtime: new Date(),
          status: "PENDING",
          sosid: sos.id,
          remark: body["remark"],
          photo: body["photo"],
          userid: userid,
        },
      });

      try {
        // send noti to staff
        const staffs = await prisma.user.findMany({
          where: {
            role: 'STAFF'
          }
        });
        if (staffs) {
          staffs.forEach(s => {
            sendpushtofirebasetoken(s.firebasetoken, "ຂໍຄວາມຊ່ວຍເຫຼືອ (Customer need help)", body["remark"]);
          });
        }
      } catch (error) {
        logger.error("ERRORS", error);
      }
    }
    return res.send(sos);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});
router.post("/request", async (req, res) => {
  try {
    const body = req.body;
    const userid = body["userid"] || '0';
    let sos_request = await prisma.sos_tickets.findMany({
      where: {
        userid: parseInt(userid),
        OR: [
          { status: "PROCESSING" },
          { status: "PENDING" }
        ]
      },
    });
    if (sos_request.length == 0) {

      sos_request =
        await prisma.sos_tickets.create({
          data: {
            lat: body["lat"],
            lng: body["lng"],
            acc: body["accuracy"],
            userid: parseInt(userid),
            description: body["desciption"]
          },
          include: {
            user: true
          }
        });
    } else {
      return res.status(500).send({ message: `The request is in ${sos_request[0]['status']}`, status: `${sos_request[0]['status']}` });
    }
    return res.send(sos_request);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }

});
router.get("/request/get", async (req, res) => {
  try {
    const result = await prisma.sos_tickets.findMany({
      include: {
        user: true
      }
    })
    return res.send(result);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/request/user", async (req, res) => {
  const userid = req.query['userid'];
  try {
    const result = await prisma.sos_tickets.findMany({
      where: {
        userid: parseInt(userid)
      },
      include: {
        user: true,
      }
    })
    return res.send(result);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/detail", async (req, res) => {
  const params = req.query;
  try {
    const response = await prisma.sos_logs.findFirst({
      where: {
        ticket_id: parseInt(params['ticket_id']),
        status: params['status']
      },
      include: {
        user: true,
        sos_tickets: true
      }
    });
    return res.send(response);
  } catch (error) {
    logger.error("ERROR", error);
    return res.send({ message: error.message });
  }
});

router.get("/request/id", async (req, res) => {
  try {
    const response = await prisma.sos_tickets.findFirst({
      where: {
        ticket_id: parseInt(req.query['ticket_id']),
      },
      include: {
        user: true,

      }
    });
    return res.send(response);
  } catch (error) {
    logger.error("ERROR", error);
    return res.send({ message: error.message });
  }

});

module.exports = router;
