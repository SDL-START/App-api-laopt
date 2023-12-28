const express = require("express");
const moment = require("moment");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const logger = require("../utils/logger");

router.post("/", async (request, reply) => {
  const form = new formidable.IncomingForm();
  form.parse(request, (err, fields, files) => {
    try {
      if (err) {
        logger.error("ERROR", err);
        return reply.status(500).send({
          status: "ERROR",
          message: err.message,
        });
      }
      if (fields) {
        logger.debug("FIELDS", fields);
      }
      const oldpath = files.filetoupload.filepath;
      const uploadpath = `uploads/`;
      const newpath = `${moment().format("YYYYMMDDHHmmss")}-${files.filetoupload.originalFilename}`;
      fs.rename(oldpath, `${uploadpath}${newpath}`, (err) => {
        if (err) {
          logger.error("ERROR", err);
          return reply.status(500).send({ message: err.message });
        }
        return reply.send({
          result: "OK",
          message: "Success",
          name: newpath,
        });
      });
    } catch (error) {
      logger.error("ERROR", err);
      return reply.send({
        result: "ERROR",
        message: error,
        name: newpath,
      });
    }
  });
});

module.exports = router;
