const { PrismaClient, prisma } = require("@prisma/client");
const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();

router.post("/changepassword", async (request, reply) => {
  const body = request.body;
  if (body["newPassword"] !== body["confirmPassword"]) {
    return reply.status(400).send({
      message: "Passwords do not match",
    });
  }

  try {
    const prisma = new PrismaClient();
    let user = await prisma.user.findFirst({
      where: {
        id: body.id,
        password: body["currentPassword"],
        status: "ACTIVE",
      },
    });
    if (!user) {
      return reply.status(404).send({
        message: "User Not Found",
      });
    }
    await prisma.user.update({
      where: {
        id: request.user["id"],
      },
      data: {
        password: body["newPassword"],
      },
    });
    return reply.send({
      result: "OK",
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("ERROR", error);
    return reply.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/devicetoken", async (request, reply) => {
  const body = request.body;
  try {
    await prisma.user.update({
      where: {
        id: Number(request.user["id"]),
      },
      data: {
        firebasetoken: body["devicetoken"],
      },
    });
    return reply.send({
      result: "OK",
    });
  } catch (error) {
    logger.error("ERROR", error);
    return reply.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

//get user by id
router.get("/get/:id",async (req,res)=>{
  const id = req.params.id;
  try{
    const prisma = new PrismaClient();
    let result = await prisma.user.findFirst({
      where:{
        id:Number(id)
      }
    });
    return res.send(result);

  }catch(e){
    return res.status(500).send({ message: e.message });
  }
});
module.exports = router;
