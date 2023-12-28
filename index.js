const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./middlewares/auth");
const nocache = require("nocache");
const logger = require("./utils/logger");
const fs = require("fs");
const path = require("path");
var https = require("https");
const moment = require("moment");
const pubnubutil = require("./utils/pubnubutil");
const ejs = require("ejs");

// read cert file
// const privateKey = fs.readFileSync("./certs/private.key", "utf8");
// const certificate = fs.readFileSync("./certs/certificate.crt", "utf8");
// const rootCA = fs.readFileSync("./certs/ca_bundle.crt", "utf8");
// const credentials = { key: privateKey, cert: certificate, ca: rootCA };
// var httpsServer = https.createServer(credentials, app);

require("dotenv").config();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.use(nocache());
app.set("etag", false);
app.use(cors());
app.use("/public", express.static("uploads/"));
app.use("/lotto", express.static("lotto/"));
app.use("/images", express.static("images/"));
app.use(express.static("html"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//subscribe PubNub
// if (process.env.DEBUG === "false") {
pubnubutil.sub();
// }

function modifyResponseBody(req, res, next) {
  logger.debug(`REQUEST TO: [${req.url}]`, req.body);
  var oldSend = res.send;
  // const privatekey = fs.readFileSync("serverkeys/serverprivatekey.pkcs8", "utf8");
  res.send = function (data) {
    // data = JSON.stringify(data);
    //const signature = myutil.sign(privatekey, data);
    //res.header("X-Server-Signature", signature);
    logger.debug(`RESPONSE FROM [${req.url}]`, data);
    oldSend.apply(res, [data]);
  };
  next();
}

app.use(modifyResponseBody);

app.use("", (req, res, next) => {
  //res.send({ message: "hello" });
  next();
});

app.use((error, req, res, next) => {
  logger.debug("ERROR HANDLING MIDDLEWARE CALLED");
  logger.debug("PATH: ", req.path);
  next();
});

app.use("/", require("./routes/index"));
app.use("/login", require("./routes/login"));
app.use("/register", require("./routes/register"));
app.use("/forgotpassword", require("./routes/forgotpassword"));
app.use("/sinxai", require("./routes/sinxai"));
app.use("/mmc", require("./routes/mmc"));
app.use("/kaenoi", require("./routes/kaenoi"));

app.use("/app", require("./routes/app"));
app.use("/translation", require("./routes/translation"));
app.use("/language", require("./routes/language"));
app.use("/imageslide", require("./routes/imageslide"));
app.use("/insurancetype", require("./routes/insurancetype"));
app.use("/insurancepackage", require("./routes/insurancepackage"));
app.use("/payment", require("./routes/payment"));

app.use("/user", auth, require("./routes/user"));
app.use("/menu", auth, require("./routes/menu"));
app.use("/registerupload", require("./routes/upload"));
app.use("/upload", auth, require("./routes/upload"));
app.use("/profile", auth, require("./routes/profile"));
app.use("/certificate", auth, require("./routes/certificate"));
app.use("/myinsurance", auth, require("./routes/myinsurance"));
app.use("/claim", auth, require("./routes/claim"));
app.use("/sos", auth, require("./routes/sos"));
app.use("/sosservice",auth, require("./routes/sos/sos_services"));
app.use("/sosmessage",auth,require("./routes/sos/message"));
app.use("/location",auth,require("./routes/sos/location"));

//staff
app.use("/staff", auth, require("./routes/staff"));

//admin
app.use("/admin/login", require("./routes/login"));
app.use("/admin/covid", auth, require("./routes/admin/covid"));
app.use("/admin/customer", auth, require("./routes/admin/customer"));
app.use("/admin/data", auth, require("./routes/admin/data"));
app.use("/admin/report", auth, require("./routes/admin/report"));
app.use("/admin/user", auth, require("./routes/admin/user"));
app.use("/admin/report", auth, require("./routes/admin/report"));
app.use("/admin/helpcenter", auth, require("./routes/admin/helpcenter"));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  logger.debug(`APP SERVER STARTED ON PORT ${port}`);
});

server.setTimeout(10000);

// if (process.env.DEBUG === "false") {
//   httpsServer.listen(443, () => {
//     console.log("HTTPS Server running on port 443");
//   });
// }
