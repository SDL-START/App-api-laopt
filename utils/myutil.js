const crypto = require("crypto");
const algorithm = "SHA256";
const nodemailer = require("nodemailer");
const {sha256} = require("js-sha256");
const axios = require("axios");
const logger = require("./logger");
const {sendsms} = require("./smsutil");
const firebasekey =
  "AAAASwogfRw:APA91bFctfImGG5j1g8IKtv27QqlKLLlr7KzCmc1g9zPOhLeN6PQ3vIlTJgA4inMFBegN7aE874kkC70wHfPJkWX0H3TW8bBeRtgQAXl0VOVBwh5Pr1LjLZ0A5WEgwB5TxDxsvLYPMCc";

const myutil = {};
myutil.sign = (privatekey, data) => {
  const pv = crypto.createPrivateKey({
    key: privatekey,
    type: "pkcs8",
    format: "pem",
    passphrase: "",
  });

  const sign = crypto.createSign(algorithm, {});
  sign.update(data);
  sign.end();

  const signature = sign.sign(pv).toString("base64");
  logger.debug("SIGNATURE", signature);
  return signature;
};

myutil.coresign = (privatekey, data) => {
  const pv = crypto.createPrivateKey(privatekey);
  const sign = crypto.createSign(algorithm);
  sign.update(data);
  sign.end();

  const signature = sign.sign(pv).toString("base64");
  logger.debug("SIGNATURE", signature);
  return signature;
};

myutil.verify = (data, signature, publickey) => {
  return crypto.verify(algorithm, data, publickey, signature);
};

myutil.randomString = (length) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

myutil.randomNumber = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

myutil.genRefNo = (length = 20) => {
  const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let res = "";

  for (let i = 0; i < length; i++) {
    const rnd = Math.floor(Math.random() * code.length);
    res += code.charAt(rnd);
  }

  return res.toString();
};

myutil.hashPassword = (text) => {
  const hash = sha256.create();
  hash.update(text + process.env.JWT_SECRET);
  return hash.hex();
};

myutil.sendemail = async (toemail, subject, message, attachments) => {
  const mail = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "laoptapp@gmail.com",
      pass: "oqpiujyzvgobqqhe"// qwqxofiajnjwxfsz
    },
  });

  //single user
  const mailOptions = {
    from: "laoptapp@gmail.com",
    to: toemail,
    subject: subject,
    text: message,
    // html: html,
    attachments: attachments,
    // attachments: [
    //   {
    //     filename: "x.pdf",
    //     path: "./x.pdf",
    //   },
    // ],
  };

  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error("ERROR", error);
      throw error;
    } else {
      logger.debug("EMAIL SENT: " + info.response);
    }
  });
};

myutil.sendpushtofirebasetoken = (token, title, body) => {
  const notification = {
    title: title,
    body: body,
    icon: "@drawable/ic_launcher",
  };
  const data = {
    click_action: "FLUTTER_NOTIFICATION_CLICK",
    sound: "default",
    status: "done",
    screen: "screenA",
    data: notification,
  };

  try {
    axios
      .post(
        "https://fcm.googleapis.com/fcm/send",
        {
          notification: notification,
          data: data,
          to: token,
        },
        {
          headers: {
            Authorization: "key=" + firebasekey,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        logger.debug("RESPONSE", response.data);
      })
      .catch((error) => {
        logger.error("ERROR", error);
      });
  } catch (e) {
    logger.error("ERROR", e);
  }
};

myutil.sendpushtotopic = (title, body, data) => {
  const notification = {
    title: title,
    body: body,
    icon: "@drawable/ic_launcher",
  };
  const b = {
    // notification: notification,
    // data: {
    //   click_action: "FLUTTER_NOTIFICATION_CLICK",
    //   sound: "default",
    //   status: "done",
    //   screen: "screenA",
    // },
    topic: "laopt-public",
  };
  logger.debug("B", b);
  try {
    axios
      .post("https://fcm.googleapis.com/fcm/send", b, {
        headers: {
          Authorization: "key=" + firebasekey,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        logger.debug("RESPONSE", response.data);
      })
      .catch((error) => {
        logger.error("AXIOS", error);
      });
  } catch (e) {
    logger.error("CATCH", e);
  }
};

myutil.parsePhone = (phone) => {
  if (phone.startsWith("00")) {
    phone = `+${phone.substr(2, phone.length)}`;
  } else if (!phone.startsWith("+")) {
    phone = `+${phone}`;
  }

  return phone;
};

myutil.sendnotification = (user, certificateNo, type, isCounter = false, status = '') => {
  /*
  * @type = ['buy', 'claim', 'pay']
  * */
  const atCounter = isCounter ? 'at Counter' : ''
  const statusText = status !== '' ? `is ${status}` : ''
  //buy
  let SMS_MESSAGE = `You bought certificate #${certificateNo} ${atCounter}.`
  let EMAIL_SUBJECT = `You bought certificate #${certificateNo}.`
  let EMAIL_MESSAGE = `You have been bought certificate #${certificateNo} ${atCounter}. Please make a payment`
  let FIREBASE_SUBJECT = `You bought certificate #${certificateNo}.`
  let FIREBASE_MESSAGE = `You have been bought certificate #${certificateNo} ${atCounter}. Please make a payment`
  // claim
  if (type === 'claim') {
    SMS_MESSAGE = `You claim certificate #${certificateNo} ${atCounter}.`
    EMAIL_SUBJECT = `You claim certificate #${certificateNo} ${atCounter}.`
    EMAIL_MESSAGE = `You have been claim certificate #${certificateNo} ${atCounter}. Thank you.`
    FIREBASE_SUBJECT = `You claim certificate #${certificateNo} ${atCounter}.`
    FIREBASE_MESSAGE = `You have been claim certificate #${certificateNo} ${atCounter}. Thank you.`
    if (statusText) {
      SMS_MESSAGE = `Your claim certificate #${certificateNo} ${statusText} ${atCounter}.`
      EMAIL_SUBJECT = `Your claim certificate #${certificateNo} ${statusText} ${atCounter}.`
      EMAIL_MESSAGE = `Your have been claim certificate #${certificateNo} ${statusText} ${atCounter}. Thank you.`
      FIREBASE_SUBJECT = `Your claim certificate #${certificateNo} ${statusText} ${atCounter}.`
      FIREBASE_MESSAGE = `Your have been claim certificate #${certificateNo} ${statusText} ${atCounter}. Thank you.`
    }
  }
  // pay
  if (type === 'pay') {
    SMS_MESSAGE = `You paid certificate #${certificateNo} ${isCounter ? ' at Counter' : ''}.`
    EMAIL_SUBJECT = `You paid certificate #${certificateNo} ${isCounter ? ' at Counter' : ''}.`
    EMAIL_MESSAGE = `You have been paid certificate #${certificateNo} ${isCounter ? ' at Counter' : ''}. Thank you.`
    FIREBASE_SUBJECT = `You paid certificate #${certificateNo} ${isCounter ? ' at Counter' : ''}.`
    FIREBASE_MESSAGE = `You have been paid certificate #${certificateNo} ${isCounter ? ' at Counter' : ''}. Thank you.`
  }

  // send notification via sms
  if (user.phone && !isCounter) {
    try {
      const smsSent = sendsms(
        SMS_MESSAGE,
        user.phone
      );
      logger.debug("SMS SENT", smsSent);
    } catch (error) {
      logger.error("ERROR SENT SMS", error);
    }
  }

  // send notification via email
  if (user.email) {
    try {
      const emailSent = myutil.sendemail(
        user.email,
        EMAIL_SUBJECT,
        EMAIL_MESSAGE
      );
      logger.debug("EMAIL SENT", emailSent);
    } catch (error) {
      logger.error("ERROR SENT EMAIL", error);
    }
  }

  // send notification via push
  if (user.firebasetoken) {
    try {
      myutil.sendpushtofirebasetoken(
        user.firebasetoken,
        FIREBASE_SUBJECT,
        FIREBASE_MESSAGE
      );
    } catch (error) {
      logger.error("ERROR SENT PUSH", error);
    }
  }
}

module.exports = myutil;
