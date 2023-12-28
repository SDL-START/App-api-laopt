const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PubNub = require("pubnub");
const logger = require("./logger");
const { sendpushtofirebasetoken, sendemail } = require("./myutil");
require("dotenv").config();
const html_to_pdf = require("html-pdf-node");
const { sendsms } = require("./smsutil");
/*
 * Init PubNub
 * */
const pubnubparams = {
  subscribeKey: process.env.ONEPAY_SUBKEY,
  ssl: true,
  uuid: process.env.ONEPAY_UUID,
  autoNetworkDetection: true,
  heartbeatInterval: 1,
};
const pubnub = new PubNub(pubnubparams);

const mcid = process.env.ONEPAY_MCID;
logger.debug("MCID", mcid);
const shopcode = process.env.SHOPCODE;
logger.debug("SHOPCODE", shopcode);
const lastToken = new Date().getTime() - 3000000 * 60 * 1000 + "0000"; // get last 30ms callback transactions
logger.debug("LASTTOKEN", lastToken);
const pubnubChannel = `mcid-${mcid}-${shopcode}`;
logger.debug("PUBNUBCHANNEL", pubnubChannel);

/*
 * Listening PubNub Messages
 * */
pubnub.addListener({
  status: (statusEvent) => {
    if (statusEvent.category === "PNConnectedCategory") {
      logger.debug("PUBNUB CONNECTED");
      logger.debug("CHANNEL:", pubnubChannel);
      logger.debug("TIMETOKEN:", lastToken);
    } else if (statusEvent.category === "PNNetworkUpCategory") {
      logger.debug("PUBNUB NETWORK UP");
      logger.debug("CHANNEL:", pubnubChannel);
      logger.debug("TIMETOKEN:", lastToken);
    } else if (statusEvent.category === "PNReconnectedCategory") {
      logger.debug("PUBNUB RECONNECTED");
      logger.debug("CHANNEL:", pubnubChannel);
      logger.debug("TIMETOKEN:", lastToken);

      // subscribe PubNub again
      this.sub();
    } else {
      logger.debug("PUBNUB DISCONNECTED");
    }
  },
  message: async (message) => {
    logger.debug(
      "...........................INCOMING MESSAGE..........................."
    );
    logger.debug("PUBNUB MESSAGE", message.message);

    try {
      /*
       * Process
       * */
      const msg = JSON.parse(message.message);
      if (msg.mcid !== process.env.ONEPAY_MCID) {
        return;
      }

      const exist = await prisma.payment.findFirst({
        where: {
          ref: msg["fccref"],
        },
      });
      if (exist) {
        logger.debug(`DUPLICATED PAYMENT REF ${msg["fccref"]}`);
        return;
      }

      const certificate = await prisma.certificate.findFirst({
        where: {
          no: msg["iid"],
        },
        include: {
          user: true,
        },
      });
      if (certificate) {
        logger.error("CERTIFICATE FOUNDX");

        await prisma.certificate.updateMany({
          where: {
            id: certificate.id,
          },
          data: {
            status: "PAID",
          },
        });

        await prisma.payment.create({
          data: {
            ref: msg["fccref"],
            certificate_id: certificate.id,
            channel: "BCELONE",
            rawresponse: msg,
            user_id: certificate.user_id,
            createdtime: new Date(),
          },
        });

        logger.debug("SMS", certificate.user.phone);
        const subject = `LAOPT Insurance - Your insurance certificate NO:${certificate.no} has been paid`;
        try {
          if (certificate.user.phone)
            await sendsms(subject, certificate.user.phone);
        } catch (error) {
          logger.error("ERROR", error);
        }

        const url = `https://api.laospt.com/policyschedule?id=${certificate.id}&no=${certificate.no}`;
        const emailmessage = `Your payment of Covid-19 Insurance certificate NO: ${certificate.no} was successful.
    Please read more detail about policy (${url}).
    Please print out the schedule card from this link ${url} 
    or show it on mobile app to official at arrival check-in pont.
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
          sendemail(certificate.user.email, subject, emailmessage);
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
            sendemail(certificate.user.email, subject, emailmessage, [
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
    } catch (error) {
      logger.error("ERROR", error);
    }
  },
  presence: (presenceEvent) => {
    logger.debug("PRESENCEEVENT", presenceEvent);
  },
});

exports.sub = () => {
  pubnub.subscribe({
    channels: [pubnubChannel],
    timetoken: lastToken,
  });
};
