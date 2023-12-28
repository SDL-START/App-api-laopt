const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { sendsms } = require("../utils/smsutil");
const { sendemail, sendpushtofirebasetoken } = require("../utils/myutil");
const html_to_pdf = require("html-pdf-node");
const prisma = new PrismaClient();
const logger = require("../utils/logger");

router.post("/success", async (req, res) => {
  try {
    const body = req.body;
    logger.debug("PAYMENTGATEWAYREQBODY", body);
    if (body["auth_response"] != "00") {
      return res.redirect("/paymentfail.html");
    }

    const certificateno = body["req_reference_number"];
    const ref = `${certificateno}-${body["auth_code"]}`;
    const exist = await prisma.payment.findFirst({
      where: {
        ref: ref,
        channel: "PAYMENT_GATEWAY",
      },
    });
    if (exist) {
      return res.redirect("/paymentfail.html");
    }
    const certificate = await prisma.certificate.findFirst({
      where: {
        no: certificateno,
        amount: Number(body["req_amount"]),
        // status: "PENDING",
      },
      include: {
        user: true,
        insurancepackage: true,
      },
    });
    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    let p = certificate.insurancepackage.period;
    p = p ? p * 1 : 1;

    await prisma.certificate.update({
      data: {
        status: "PAID",
        expirytime: new Date(
          moment().add(p, "M").format("YYYY-MM-DD HH:mm:ss")
        ),
      },
      where: {
        id: certificate.id,
      },
    });

    await prisma.payment.create({
      data: {
        createdtime: new Date(),
        certificate_id: certificate.id,
        user_id: certificate.user_id,
        channel: "PAYMENT_GATEWAY",
        ref: ref,
        rawresponse: body,
      },
    });

    logger.debug("SMS", certificate.user.phone);
    const subject = `LAOPT Insurance - Your insurance certificate has been paid`;
    try {
      if (certificate.user.phone)
        await sendsms(subject, certificate.user.phone);
    } catch (error) {
      logger.error("ERROR", error);
    }

    const url = `https://api.laospt.com/policyschedule?id=${certificate.id}&no=${certificate.no}`;
    const message = `Your payment of Covid-19 Insurance certificate NO: ${certificate.no} was successful.
    Please read more detail about policy (${url}) .
    Please print out the schedule card from this link ${url} or show it on mobile app to official at arrival check-in pont.
    Have a good travel and to be healthy.
    For your travel. Please visit website of following:
    
    https://www.tourismlaos.org/
    https://wearelao.com/
    
    
    
    Best regards,
    
      Logo   Thavisub insurance broker
    www.laospt.com
    email: laoptapp@gmail.com
    Tel: +856 20 99 117 878
  
    `;
    try {
      logger.debug(
        "SEND EMAIL TO CERTIFICATE.USER.EMAIL",
        certificate.user.email
      );
      sendemail(certificate.user.email, subject, message);
    } catch (error) {
      logger.error("ERROR", error);
    }

    try {
      const options = { format: "A4" };
      const file = { url: url };
      html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
        logger.debug("PDF BUFFER:-", pdfBuffer);
        logger.debug(
          "SEND EMAIL TO CERTIFICATE.USER.EMAIL",
          certificate.user.email
        );
        sendemail(certificate.user.email, subject, message, [
          {
            filename: `policy-schedule-${certificate.no}.pdf`,
            path: pdfBuffer,
          },
        ]);
      });
    } catch (error) {
      logger.error("ERROR", error);
    }

    try {
      sendpushtofirebasetoken(
        certificate.user.firebasetoken,
        "Payment Success",
        "Your insurance certificate has been paid successfully."
      );
    } catch (error) {
      logger.error("ERROR", error);
    }

    return res.redirect("/paymentsuccess.html");
  } catch (e) {
    logger.error("ERROR", e);
    return res.redirect("/paymentfail.html");
  }
});

router.post("/gateway", async (req, res) => {
  logger.debug("PAYMENT GATEWAY CALLBACK FROM:", req.originalUrl);
  logger.debug("PAYMENT GATEWAY CALLBACK:", req.body);

  try {
    const body = req.body;
    if (body["auth_response"] !== "00") {
      return res.redirect("/paymentfail.html");
    }

    const certificateno = body["req_reference_number"];
    const ref = `${certificateno}-${body["auth_code"]}`;
    const certificate = await prisma.certificate.findFirst({
      where: {
        no: certificateno,
      },
      include: {
        user: true,
      },
    });
    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    if (certificate && certificate.status !== 'PAID') {
      await prisma.certificate.update({
        data: {
          status: "PAID",
        },
        where: {
          id: certificate.id,
        },
      });

      await prisma.payment.create({
        data: {
          createdtime: new Date(),
          certificate_id: certificate.id,
          user_id: certificate.user_id,
          channel: "PAYMENT_GATEWAY",
          ref: ref,
          rawresponse: body,
        },
      });

      logger.debug("SMS", certificate.user.phone);
      const subject =
        "LAOPT Insurance - Your insurance certificate has been paid";
      try {
        if (certificate.user.phone)
          await sendsms(subject, certificate.user.phone);
      } catch (error) {
        logger.error("ERROR", error);
      }

      const url = `https://api.laospt.com/policyschedule?id=${certificate.id}&no=${certificate.no}`;
      const message = `Your payment of Covid-19 Insurance certificate NO: ${certificate.no} was successful.
    Please read more detail about policy (${url}) .
    Please print out the schedule card from this link ${url} or show it on mobile app to official at arrival check-in pont.
    Have a good travel and to be healthy.
    For your travel. Please visit website of following:
    
    https://www.tourismlaos.org/
    https://wearelao.com/
    
    
    
    Best regards,
    
      Logo   Thavisub insurance broker
    www.laospt.com
    email: laoptapp@gmail.com
    Tel: +856 20 99 117 878
  
    `;
      try {
        logger.debug(
          "SEND EMAIL TO CERTIFICATE.USER.EMAIL",
          certificate.user.email
        );
        sendemail(certificate.user.email, subject, message);
      } catch (error) {
        logger.error("ERROR", error);
      }

      try {
        const options = {format: "A4"};
        const file = {url: url};
        html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
          logger.debug("PDF BUFFER:-", pdfBuffer);
          logger.debug(
            "SEND EMAIL TO CERTIFICATE.USER.EMAIL",
            certificate.user.email
          );
          sendemail(certificate.user.email, subject, message, [
            {
              filename: `policy-schedule-${certificate.no}.pdf`,
              path: pdfBuffer,
            },
          ]);
        });
      } catch (error) {
        logger.error("ERROR", error);
      }

      try {
        sendpushtofirebasetoken(
          certificate.user.firebasetoken,
          "Payment Success",
          "Your insurance certificate has been paid successfully."
        );
      } catch (error) {
        logger.error("ERROR", error);
      }
    }

    return res.redirect("/paymentsuccess.html");
  } catch (e) {
    logger.error("PAYMENT GATEWAY CALLBACK ERROR", e);
    return res.redirect("/paymentfail.html");
  }
});

module.exports = router;
