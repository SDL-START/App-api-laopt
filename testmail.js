const { prisma } = require("@prisma/client");
const html_to_pdf = require("html-pdf-node");
const { sendemail } = require("./utils/myutil");
const moment = require("moment");

let options = { format: "A4" };
const url = `https://api.laospt.com/policyschedule?id=247&no=552348760`;
let file = { url: url };
const logger = require("./utils/logger");

try {
  sendemail(
    // "krattanavong@gmail.com",
    // "laodebug@gmail.com",
    "punya.lattanavong@gmail.com",
    "LAOPT Insurance - Your insurance certificate has been paid",
    `Thank you. Your insurance certificate has been paid successfully.
    Please click the link: ${url} to see the policy schedule details.
    More information can be found at https://laospt.com.
          `
  );
} catch (error) {
  logger.error(error);
}
// try {
//   html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
//     const id = 247;
//       const no = '552348760';
//       const certificate = await prisma.certificate.findFirst({
//         where: {
//           id: id,
//           no: no,
//         },
//         include: {
//           user: true,
//         },
//       });
//       if (!certificate) {
//         return res.status(404).send({ message: "Certificate not found" });
//       }
//       if (certificate.status !== "PAID") {
//         return res.status(400).send({ message: "Certificate status incorrect" });
//       }
//       certificate["user"]["dob"] = moment(certificate["user"]["dob"]).format("DD/MM/YYYY");
//       const createdtime = certificate["createdtime"];
//       certificate["createdtime"] = moment(createdtime).format("DD/MM/YYYY");
//       certificate["expiredtime"] = moment(createdtime).add(1, "years").format("DD/MM/YYYY");
//       const html = res.render("policyschedule", { certificate: certificate });

//       sendemail(
//       "laodebug@gmail.com",
//       "LAOPT Insurance - Your insurance certificate has been paid",
//       `Thank you. Your insurance certificate has been paid successfully.
//       Please click the link: ${url} to see the policy schedule details.
//       More information can be found at https://laospt.com.
//             `,
//       [
//         {
//           filename: `policy-schedule-552348760.pdf`,
//           path: pdfBuffer.values(),
//         },
//         {
//           filename: `html-policy-schedule-552348760.pdf`,
//           path: html,
//         },
//       ]
//     );
//   });
// } catch (error) {
//   logger.error("ERROR", error);
// }
