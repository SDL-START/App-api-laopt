const express = require("express");
const router = express.Router();
const pushNoti = require("./push_noti");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


router.get("/", async (req, res) => {
  try {
    let allticket = await prisma.sos_tickets.findMany({
      include: {
        user: true,
        sos_info: true,
      },
    });
    return res.status(200).json(allticket);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.get("/staff", async (req, res) => {
  let params = req.query;
  try {
    let allticket = await prisma.sos_tickets.findMany({
      where: {
        accepterId: Number(params.userId),
      },
      include: {
        user: true,
      },
    });
    return res.status(200).json(allticket);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.post("/request", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    //check sos requested or not
    let requested = await prisma.sos_tickets.findMany({
      where: {
        requesterId: body["requesterId"],
        OR: [{ status: "INPROGRESS" }, { status: "PENDING" }],
      },
    });
    if (requested.length === 0) {
      let sosRequest = await prisma.sos_tickets.create({
        data: body,
        include: {
          user: true,
        },
      });

      //push notification
      let userStaff = await prisma.user.findMany({
        where: {
          role: "STAFF",
        },
      });
      if (userStaff) {
        userStaff.forEach((user) => {
          pushNoti(
            user.firebasetoken,
            "ຂໍຄວາມຊ່ວຍເຫຼືອ (Customer need help)",
            body["description"]
          );
        });
      }
      return res.status(200).json(sosRequest);
    } else {
      return res.status(500).json({
        message: "You have been requested",
        status: 500,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.post("/accepted", async (req, res) => {
  try {
    let body = req.body;
    let accepted = await prisma.sos_info.create({
      data: body,
      include: {
        user: true,
        sos_tickets: true,
      },
    });

    //Update sos ticket
    if (accepted) {
      let ticket = await prisma.sos_tickets.update({
        data: {
          status: "INPROGRESS",
          accepterId: body.staffId,
        },
        where: {
          ticketId: body["ticketId"],
        },
        include: {
          user: true,
        },
      });
      pushNoti(
        ticket.user.firebasetoken,
        "Your SOS request was accepted",
        body["description"] ?? ""
      );
      return res.status(200).json(accepted);
    } else {
      return res.status(500).json({
        message: "Something want wrong",
        status: 500,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.post("/completed", async (req, res) => {
  try {
    let body = req.body;
    let complete = await prisma.sos_info.create({
      data: body,
      include: {
        user: true,
        sos_tickets: true,
      },
    });

    //Update sos ticket
    if (complete) {
      let ticket = await prisma.sos_tickets.update({
        data: {
          status: "COMPLETED",
        },
        where: {
          ticketId: body["ticketId"],
        },
        include: {
          user: true,
        },
      });

      //Push notification
      pushNoti(
        ticket.user.firebasetoken,
        "Your sos has been complete",
        body["description"] ?? ""
      );
      return res.status(200).json(complete);
    } else {
      return res.status(500).json({
        message: "Something want wrong",
        status: 500,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.post("/canceled", async (req, res) => {
  try {
    let body = req.body;
    let action = await prisma.sos_info.create({
      data: body,
      include: {
        user: true,
        sos_tickets: true,
      },
    });

    //Update sos ticket
    if (action) {
      let ticket = await prisma.sos_tickets.update({
        data: {
          status: "CANCELED",
          accepterId: body.staffId,
        },
        where: {
          ticketId: body["ticketId"],
        },
        include: {
          user: true,
        },
      });

      //Push notification
      pushNoti(
        ticket.user.firebasetoken,
        "Your sos has been complete",
        body["description"] ?? ""
      );
      return res.status(200).json(accepted);
    } else {
      return res.status(500).json({
        message: "Something want wrong",
        status: 500,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

//user cancel
router.put("/cancel", async (req, res) => {
  try {
    console.log(req.query);
    let ticketId = Number(req.query.ticketId);
    await prisma.sos_tickets.update({
      data: {
        status: "CANCELED",
      },
      where: {
        ticketId: ticketId,
      },
    });
    return res.status(200).json({
      status: 200,
      message: "Cancel success",
    });
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    let ticket = await prisma.sos_tickets.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: true,
      },
    });
    return res.status(200).json(ticket);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

//Get ticket histories
router.get("/histories", async (req, res) => {
  try {
    let userId = req.query.userId;
    let histories = await prisma.sos_tickets.findMany({
      where: {
        requesterId: Number(userId),
      },
      include: {
        user: true,
      },
    });
    return res.status(200).json(histories);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

//Get ticket detail
router.get("/ticketInfo", async (req, res) => {
  try {
    let ticketId = req.query.ticketId;
    let ticket = await prisma.sos_tickets.findFirst({
      where: {
        ticketId: Number(ticketId),
      },
      include: {
        user: true,
      },
    });
    if (ticket) {
      let sos_info = await prisma.sos_info.findFirst({
        where: {
          ticketId: Number(ticketId),
          status: ticket.status,
        },
        include: {
          user: true,
        },
      });
      ticket["sos_info"] = sos_info;
    }
    return res.status(200).send(ticket);
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
