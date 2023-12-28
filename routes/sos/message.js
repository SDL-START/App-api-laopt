const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/send", async (req, res) => {
  try {
    let body = req.body;
    let message = await prisma.sos_messages.create({
      data: body,
    });

    if(body.message_type == "LIVE_LOCATION"){
      await prisma.location_log.create({
        data:{
          messageId: message.messageId,
          lat: message.lat,
          lng: message.lng,
        }
      });
    }
    return res.status(200).json({
      status: 200,
      message: "success",
    });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    let ticketId = req.query.ticketId;
    let messages = await prisma.sos_messages.findMany({
      where: {
        ticketId: Number(ticketId),
      },
    });
    if (messages) {
      for (var message of messages) {
        console.log(message);
        //get sender
        let sender = await prisma.user.findFirst({
          where: {
            id: message.senderId,
          },
        });
        message["sender"]= sender;

        //get reveiver
        let receiver = await prisma.user.findFirst({
          where: {
            id: message.receiverId,
          },
        });
        message["reveiver"] = receiver;
      }
    }
    return res.status(200).json(messages);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
