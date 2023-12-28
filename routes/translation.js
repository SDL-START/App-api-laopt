const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

router.get("/gets", async (req, res) => {
  try {
    const items = await prisma.translation.findMany();
    return res.send(items);
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

router.get("/json/:code", async (req, res) => {
  let code = req.params["code"];
  try {
    const items = await prisma.translation.findMany();
    let jsonUS = {};
    let jsonLA = {};
    let jsonCN = {};
    let jsonJP = {};
    let jsonVN = {};
    for (var item of items) {
      jsonUS[item['word']] = item.translate.us ?? "";
      jsonLA[item['word']] = item.translate.la ?? "";
      jsonCN[item['word']] = item.translate.cn ?? "";
      jsonJP[item['word']] = item.translate.jp ?? "";
      jsonVN[item['word']] = item.translate.vn ?? "";
    }
    if(code =="us"){
      return res.send(jsonUS);
    }else if(code == "la"){
      return res.send(jsonLA);
    }else if(code == "cn"){
      return res.send(jsonCN);
    }else if(code == "jp"){
      return res.send(jsonJP);
    }else if (code == 'vn'){
      return res.send(jsonVN);
    }else{
      return res.send({meesage:`The language ${code} is not supported`});
    }
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(500).send({ message: e.message });
  }
});

module.exports = router;
