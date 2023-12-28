const { PrismaClient } = require("@prisma/client");
const express = require("express");
const moment = require("moment");
const router = express.Router();

router.get("/get", async (request, reply) => {
  try {
    const name = request.params["name"];
    return reply.send({ message: "OK" });
  } catch (error) {
    return reply.status(500).send({
      result: "ERROR",
      message: error,
    });
  }
});

module.exports = router;
