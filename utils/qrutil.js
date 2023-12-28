const logger = require("./logger");

var crcTable = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
  0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
  0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
  0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
  0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
  0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
  0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];

exports.generatePaymentQR = function (merchantData, amount = 0, billno, reference, terminal, purpose, expire, action) {
  try {
    let emvco;
    if (amount !== undefined || amount > 0) {
      // create dynamic qr with amount and purpose
      emvco = {
        0: "01",
        1: "12", //"11:Static, 12:Dynamic"
        38: {
          0: "A005266284662577",
          1: "90100418",
          2: "002", //"001: transfer, 002: QR payment"
          3: merchantData.mcid, // merchant number
          4: expire, // QR code expire time
          5: action, // action when payment success
        },
        52: merchantData.mcc, //Merchant Category code
        53: "418", //CCY
        54: amount, //Amount
        58: "LA", //Country Code
        59: merchantData.merchantname, //merchant name
        60: merchantData.province, //Merchant city,
        62: {
          1: billno, // bill no
          5: reference, // reference
          7: terminal, // terminal
          8: purpose, //purpose
        },
      };
      // remove when 62 not contain sub tag
      if (billno === undefined && reference === undefined && terminal === undefined && purpose === undefined) delete emvco[62];
    } else {
      // create emvco QR string
      emvco = {
        0: "01",
        1: "11", //"11:Static, 12:Dynamic"
        38: {
          0: "A005266284662577",
          1: "90100418",
          2: "002", //"001: transfer, 002: QR payment"
          3: merchantData.mcid,
        },
        52: merchantData.mcc, //Merchant Category code
        53: "418", //Transaction Currency
        58: "LA", //Country Code
        59: merchantData.merchantname, //merchant name
        60: merchantData.province, //Merchant city,
      };
    }
    return this.buildEmvQr(emvco);
  } catch (e) {
    logger.debug("generatePaymentQR" + e.message);
    return undefined;
  }
};

exports.generateTransferQR = function (userid, amount = 0, purpose = "") {
  try {
    let emvco;
    if (amount !== undefined || amount > 0) {
      // create dynamic qr with amount and purpose
      emvco = {
        0: "01",
        1: "12", //"11:Static, 12:Dynamic"
        38: {
          0: "A005266284662577",
          1: "90100418",
          2: "001", //"001: transfer, 002: QR payment"
          3: userid, // merchant number
        },
        52: "5251", //MCC
        53: "418", //CCY
        54: amount, //Amount
        58: "LA", //Country Code
        60: "Vientiane", //Merchant city,
        62: {
          8: purpose, //purpose
        },
      };
      if (purpose === undefined || purpose === "") delete emvco[62];
    } else {
      // static QR code
      emvco = {
        0: "01",
        1: "11", //"11:Static, 12:Dynamic"
        38: {
          0: "A005266284662577",
          1: "90100418",
          2: "001", //"001: transfer, 002: QR payment"
          3: userid,
        },
        52: "5251", //Merchant Category code
        53: "418", //Transaction Currency
        58: "LA", //Country Code
        60: "Vientiane", //Merchant city
      };
    }
    return this.buildEmvQr(emvco);
  } catch (e) {
    logger.debug("GENERATETRANSFERQR", e);
    return undefined;
  }
};

exports.generateEslipQR = function (ticket, fccref, reference) {
  try {
    let emvco = {
      0: "01",
      1: "11",
      37: {
        0: "ESLIP",
        1: ticket,
        2: fccref,
        3: reference,
      },
    };
    return this.buildEmvQr(emvco);
  } catch (e) {
    logger.debug("GENERATEESLIPQR", e);
    return undefined;
  }
};

exports.parseEmvQr = function (qrcode) {
  try {
    if (!(qrcode.startsWith("000201010211") || qrcode.startsWith("000201010212"))) throw new Error("QR is not a supported EMV format");
    var res = parseEmvQrLine(qrcode);
    if (res[37]) res[37] = parseEmvQrLine(res[37]);
    if (res[38]) res[38] = parseEmvQrLine(res[38]);
    if (res[62]) res[62] = parseEmvQrLine(res[62]);
    if (res[64]) res[64] = parseEmvQrLine(res[64]);
    return res;
  } catch (e) {
    logger.debug("PARSEEMVQR", e);
    return undefined;
  }
};

exports.buildEmvQr = function (arr, nochecksum) {
  var res = "";
  for (var key in arr) {
    if (!arr[key]) continue;
    var val = typeof arr[key] === "object" ? this.buildEmvQr(arr[key], true) : arr[key].toString();
    res += this.padZero(key) + this.padZero(val.length) + val;
  }
  if (!nochecksum) {
    var field63 = "6304";
    var crc = this.crc16(res + field63);
    res = res + field63 + crc;
  }
  return res;
};

exports.crc16 = function (s) {
  var crc = 0xffff;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c > 255) {
      throw new RangeError();
    }
    var j = (c ^ (crc >> 8)) & 0xff;
    crc = crcTable[j] ^ (crc << 8);
  }
  var ret = ((crc ^ 0) & 0xffff).toString(16).toUpperCase();
  return this.padZero(ret, 4);
};

exports.padZero = function (num, size = 2) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
};

exports.getBankByIIN = function (iin) {
  switch (iin) {
    case "90100418":
      return "SMONEY";
    case "27710418":
      return "BCEL";
    case "32170418":
      return "JDB";
    case "70020418":
      return "APB";
    case "70030418":
      return "LDB";
    case "70040418":
      return "MJB";
    case "70050418":
      return "LVB";
    case "70070418":
      return "ICBC";
    case "70080418":
      return "ACLE";
    case "70100418":
      return "BOC";
    case "70110418":
      return "BIC";
    case "70120418":
      return "VTB";
    case "70130418":
      return "SACOM";
    case "70140418":
      return "IDB";
    case "70150418":
      return "STB";
    case "70160418":
      return "PPB";
    case "70170418":
      return "KBANK";
    default:
      return "Unknow";
  }
};

exports.getInfoByPaymentType = function (paymenttype) {
  switch (paymenttype) {
    case "001":
      return "Credit fund transfer";
    case "002":
      return "QR Payment";
    case "003":
      return "Bill payment";
    case "004":
      return "E-donation";
    case "005":
      return "E-Commerce";
    case "006":
      return "Electric Payment";
    case "007":
      return "Water Payment";
    case "008":
      return "Tax Payment";
    case "009":
      return "Government pay";
    default:
      return "Unknow";
  }
};

function parseEmvQrLine(qrcode) {
  var res = {};
  var qrlen = qrcode.length;
  var pos = 0;
  try {
    while (pos < qrlen) {
      var field = parseInt(qrcode.substring(pos, pos + 2));
      var length = parseInt(qrcode.substring(pos + 2, pos + 4));
      var data = qrcode.substring(pos + 4, pos + 4 + length);
      res[field] = data;
      pos += 4 + length;
    }
  } catch (error) {
    logger.error("PARSEEMVQRLINE", error);
    return undefined;
  }
  return res;
}
