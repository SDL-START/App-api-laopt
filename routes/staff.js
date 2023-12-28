const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const { sendpushtofirebasetoken } = require("../utils/myutil");

const prisma = new PrismaClient();

router.get("/sos/gets", async (req, res) => {
  try {
    const items = await prisma.sos.findMany({
      include: { user: true },
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

router.post("/sos/:action", async (req, res) => {
  try {
    const body = req.body;
    let action = req.params["action"];
    let id = body["ticket_id"];
    let status = body["status"];
    let description = body["description"];
    let userid = body["userid"];
    let lat = body['lat'];
    let lng = body['lng'];
    let acc = body['acc'];


    if (action == "accept") {
      //Update sos ticket
      await prisma.sos_tickets.update({
        data: {
          status: "PROCESSING",
        },
        where: {
          ticket_id: id,
        },
      });

      //accept sos database
      await prisma.sos_logs.create({
        data: {
          ticket_id: parseInt(id),
          userid: parseInt(userid),
          description: description,
          status: status,
          lat: lat.toString(),
          lng: lng.toString(),
          acc: acc.toString(),
        }
      });
    } else if (action == "complete") {
      //Update sos ticket
      await prisma.sos_tickets.update({
        data: {
          status: "COMPLETED",
        },
        where: {
          ticket_id: id,
        },
      });

      //confirm sos database
      await prisma.sos_logs.create({
        data: {
          ticket_id: id,
          userid: userid,
          description: description,
          status: status,
          lat: lat.toString(),
          lng: lng.toString(),
          acc: acc.toString(),
        }
      });
    } else if (action == "cancel") {
      //Update sos ticket
      await prisma.sos_tickets.update({
        data: {
          status: "CANCELLED",
        },
        where: {
          ticket_id: id,
        },
      });
      //confirm sos database
      await prisma.sos_logs.create({
        data: {
          ticket_id: id,
          userid: userid,
          description: description,
          status: status,
          lat: lat.toString(),
          lng: lng.toString(),
          acc: acc.toString(),
        }
      });
    }
    let sos_request = await prisma.sos_tickets.findFirst({
      where: {
        ticket_id: id,
      },
      include: {
        user: true
      }
    });
    try {
      // send noti to customer
      sendpushtofirebasetoken(
        sos_request.user.firebasetoken,
        `Your SOS request was ${action}`,
        body["remark"]
      );
    } catch (error) {
      logger.error("ERROR SENDPUSHTOFIREBASETOKEN", error);
    }
    return res.send(sos_request);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/sos/pending", async (req, res) => {
  try {
    const result = await prisma.sos_tickets.findMany({
      where: {
        status: "PENDING"
      },
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
router.get("/sos/log", async (req, res) => {
  const params = req.query;
  let id = params['userid'];
  let status = params['status']
  try {
    const resonse = await prisma.sos_logs.findMany({
      where: {
        userid: parseInt(id),
        sos_tickets: {
          status: status
        },
      },
      include: {
        sos_tickets: true
      }
    });
    return res.send(resonse);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
