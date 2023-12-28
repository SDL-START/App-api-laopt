// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = "AC56675c65d0b554a04dcdd1b37d0e01c8";
const authToken = "9b49c2fdc34fdf645b5902dd6dedea0d";
const twilio = require("twilio");
const client = twilio(accountSid, authToken);
const logger = require("../utils/logger");
exports.sendsms = async function (body, to) {
  logger.debug("SENDSMS", body);
  const res = await client.messages.create({
    body: body,
    from: "LAOPT",
    to: to,
  });
  logger.debug("SENDSMSRES", res);
  return res;
};
