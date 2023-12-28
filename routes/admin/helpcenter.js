const {PrismaClient} = require("@prisma/client");
const express = require("express");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/sos", async (req, res) => {
  try {
    const tickets = await prisma.$queryRawUnsafe(`select t.*, u.firstname, u.lastname from sos_tickets t
join user u on t.userid = u.id order by t.create_at desc`)

    if (!tickets) {
      return res.status(404).send({
        message: `Tickets not found`,
      });
    }

    return res.send(tickets);
  } catch (err) {
    return res.status(500).send({
      result: "ERROR",
      message: err.message,
    });
  }
});

router.get("/sos/:ticket", async (req, res) => {
  try {
    const params = req.params
    const ticket = await prisma.$queryRawUnsafe(`select t.*, u.firstname, u.lastname from sos_tickets t
join user u on t.userid = u.id where ticket_id = ${Number(params.ticket)}`)

    if (!ticket) {
      return res.status(404).send({
        message: `Ticket not found`,
      });
    }

    return res.send(ticket[0]);
  } catch (err) {
    return res.status(500).send({
      result: "ERROR",
      message: err.message,
    });
  }
});

module.exports = router;