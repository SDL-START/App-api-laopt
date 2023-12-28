const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();

router.get("/sale/summary", async (req, res) => {
  const params = req.query
  try {
    let groupBy = 'DATE'
    if (params && params.reportGroup === 'MONTHLY') {
      groupBy = 'MONTH'
    }
    if (params && params.reportGroup === 'YEARLY') {
      groupBy = 'YEAR'
    }
    let sql = `select ${groupBy}(c.createdtime) as txtime\n` +
      ",CONVERT(count(*), DECIMAL) as total\n" +
      ",sum(IFNULL(pk.price, 0)) as volume\n" +
      "from certificate c\n" +
      "join certificatemember m on m.certificate_id = c.id\n" +
      "join insurancepackage pk on pk.id = c.insurancepackage_id\n" +
      `where DATE(c.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`;
    if (params.reportGroup === 'LOCATION') {
      sql = "select if(ifnull(c.servicelocation_id, 'app'), s.name , 'App') txtime\n" +
        ",CONVERT(count(*), DECIMAL) total\n" +
        ",sum(IFNULL(pk.price, 0)) volume\n" +
        "from certificate c\n" +
        "left join servicelocation s on s.id = c.servicelocation_id\n" +
        "join certificatemember m on m.certificate_id = c.id\n" +
        "join insurancepackage pk on pk.id = c.insurancepackage_id\n" +
        `where DATE(c.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`;
    }
    if(params && params.reportGroup === 'COUNTRY') {
      sql = "select ct.nicename txtime\n" +
        "        ,CONVERT(count(*), DECIMAL) as total\n" +
        "        ,sum(IFNULL(pk.price, 0)) as volume\n" +
        "        from certificate c\n" +
        "        join certificatemember m on m.certificate_id = c.id\n" +
        "        join insurancepackage pk on pk.id = c.insurancepackage_id\n" +
        "        join user u on u.id = c.user_id\n" +
        "        join country ct on ct.iso = u.countrycode\n" +
        `where DATE(c.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`;
    }
    if ((params && params.serviceLocation) || req.user.role === 'SELLER') {
      sql += `and c.servicelocation_id = ${req.user.role === 'SELLER' ? req.user.servicelocation_id : params.serviceLocation}\n`;
    }
    if (params && params.buyType) {
      sql += `and c.type = '${params.buyType}'\n`;
    }
    if (params && params.buyMode) {
      sql += `and c.buy_mode = '${params.buyMode}'\n`;
    }
    if (params && params.status) {
      sql += `and c.status = '${params.status}'\n`;
    }

    if(params && params.reportGroup === 'COUNTRY') {
      sql += "group by ct.nicename\n" +
        "order by ct.nicename"
    } else if (params && params.reportGroup !== 'LOCATION') {
      sql += `group by ${groupBy}(c.createdtime)\n`;
      sql += `order by ${groupBy}(c.createdtime)\n`;
    } else {
      sql += "group by c.servicelocation_id\n" +
        "order by c.servicelocation_id"
    }

    console.log(sql);

    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Sale report summary not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/claim/summary", async (req, res) => {
  const params = req.query
  try {
    let groupBy = 'DATE'
    if (params && params.reportGroup === 'MONTHLY') {
      groupBy = 'MONTH'
    }
    if (params && params.reportGroup === 'YEARLY') {
      groupBy = 'YEAR'
    }
    let sql = `select ${groupBy}(c.reqtime) as txtime\n` +
      ",CONVERT(count(*), DECIMAL) as total\n" +
      ",sum(IFNULL(c.amount, 0)) as volume\n" +
      "from claim c\n" +
      `where DATE(c.reqtime) between date('${params.fromdate}') and date('${params.todate}')\n`;
    if (params.reportGroup === 'HOSPITAL') {
      sql = "select h.name txtime\n" +
        ",CONVERT(count(*), DECIMAL) total\n" +
        ",sum(IFNULL(c.amount, 0)) volume\n" +
        "from claim c\n" +
        "left join hospital h on h.id = c.hospital_id\n" +
        `where DATE(c.reqtime) between date('${params.fromdate}') and date('${params.todate}')\n`;
    }
    if ((params && params.hospital) || req.user.role === 'CLAIMER') {
      sql += `and c.hospital_id = ${req.user.role === 'CLAIMER' ? req.user.hospital_id : params.hospital}\n`;
    }
    if (params && params.purpose) {
      sql += `and c.type = '${params.purpose}'\n`;
    }
    if (params && params.buyMode) {
      sql += `and c.claim_mode = '${params.buyMode}'\n`;
    }
    if (params && params.status) {
      sql += `and c.status = '${params.status}'\n`;
    }

    if (params && params.reportGroup !== 'HOSPITAL') {
      sql += `group by ${groupBy}(c.reqtime)\n`;
      sql += `order by ${groupBy}(c.reqtime)\n`;
    } else {
      sql += "group by c.hospital_id\n" +
        "order by c.hospital_id"
    }

    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Claim report summary not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/sale", async (req, res) => {
  const params = req.query
  try {
    let sql = "select c.id\n" +
      ",c.no\n" +
      ",concat(m.firstname, ' ', m.lastname) customer\n" +
      ",c.type\n" +
      ",c.buy_mode\n" +
      ",IF(c.type = 'FAMILY', p.price, c.amount) amount\n" +
      ",t.name insurance_name\n" +
      ",p.name package_name\n" +
      ",concat(sl.firstname, ' ', sl.lastname) seller\n" +
      ",s.name servicelocation\n" +
      ",c.status\n" +
      ",c.createdtime\n" +
      ",pm.channel\n" +
      `from certificate c\n` +
      `left join insurancetype t on t.id = c.insurancetype_id\n` +
      `left join insurancepackage p on p.id = c.insurancepackage_id\n` +
      `left join servicelocation s on s.id = c.servicelocation_id\n` +
      `left join certificatemember m on m.certificate_id = c.id\n` +
      `left join payment pm on pm.certificate_id = c.id\n` +
      `left join user sl on sl.id = c.employee_id\n` +
      `where DATE(c.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`;

    if ((params && params.serviceLocation) || req.user.role === 'SELLER') {
      sql += `and c.servicelocation_id = ${req.user.role === 'SELLER' ? req.user.servicelocation_id : params.serviceLocation}\n`;
    }
    if (params && params.buyType) {
      sql += `and c.type = '${params.buyType}'\n`;
    }
    if (params && params.buyMode) {
      sql += `and c.buy_mode = '${params.buyMode}'\n`;
    }
    if (params && params.insuranceType) {
      sql += `and c.insurancetype_id = '${params.insuranceType}'\n`;
    }
    if (params && params.packageType) {
      sql += `and c.insurancepackage_id = '${params.packageType}'\n`;
    }
    if (params && params.status) {
      sql += `and c.status = '${params.status}'\n`;
    }

    sql += `order by c.createdtime\n`;
    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Sale report not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/claim", async (req, res) => {
  const params = req.query
  try {
    let sql = "select c.id\n" +
      ",ct.no certificateno\n" +
      ",concat(m.firstname, ' ', m.lastname) customer\n" +
      ",c.type\n" +
      ",c.claim_mode\n" +
      ",c.amount\n" +
      ",concat(cb.firstname, ' ', cb.lastname) claim_by\n" +
      ",h.name hospital\n" +
      ",c.status\n" +
      ",c.reqtime\n" +
      `from claim c\n` +
      `left join certificate ct on ct.id = c.certificate_id\n` +
      `left join hospital h on h.id = c.hospital_id\n` +
      `left join certificatemember m on m.id = c.certificatemember_id\n` +
      `left join user cb on cb.id = c.employee_id\n` +
      `where date(c.reqtime) between date('${params.fromdate}') and date('${params.todate}')\n`;

    if ((params && params.hospital) || req.user.role === 'CLAIMER') {
      sql += `and c.hospital_id = ${req.user.role === 'CLAIMER' ? req.user.hospital_id : params.hospital}\n`;
    }
    if (params && params.purpose) {
      sql += `and c.type = '${params.purpose}'\n`;
    }
    if (params && params.buyMode) {
      sql += `and c.claim_mode = '${params.buyMode}'\n`;
    }
    if (params && params.status) {
      sql += `and c.status = '${params.status}'\n`;
    }

    sql += `order by c.reqtime\n`;
    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Claim report not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/package", async (req, res) => {
  const params = req.query
  try {
    let sql = `select a.*, p.name
               from (select p.id, c.status, CONVERT(count(*), DECIMAL) total, sum(price) volume
                     from insurancepackage p
                              join certificate c on p.id = c.insurancepackage_id
                     where DATE(c.createdtime) between date ('${params.fromdate}') and date('${params.todate}')\n
               `
    if (params && params.status) {
      sql += `and c.status = '${params.status}'\n`
    }
    sql += `group by p.id, c.status) a
                   join insurancepackage p
               on p.id = a.id`;
    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Package report not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/staff", async (req, res) => {
  const params = req.query
  try {
    let type = params.type
    if (req.user.role === 'SELLER') type = 'sell';
    if (req.user.role === 'CLAIMER') type = 'claim';

    let sql = "";
    if (type === 'sell') {
      sql = "select a.*\n" +
        ",concat(b.firstname, ' ', b.lastname) staff" +
        ",'sell' type\n" +
        "from (\n" +
        "    select c.employee_id\n" +
        "    ,CONVERT(count(*), DECIMAL) total\n" +
        "    ,sum(amount) volume\n" +
        "    from certificate c\n" +
        "    join user u on u.id = c.employee_id\n" +
        "    where u.role in ('SELLER')\n" +
        `    and DATE(c.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`

      if (params && params.status) {
        sql += `and c.status = '${params.status}'\n`
      }

      if (req.user.role === "SELLER") {
        sql += `and u.id = '${req.user.id}'\n`
      }

      sql += "group by c.employee_id\n" +
        ") a\n" +
        "join user b on b.id = a.employee_id"
    }

    if (type === 'claim') {
      sql = "select a.*\n" +
        ",concat(b.firstname, ' ', b.lastname) staff" +
        ",'claim' type\n" +
        "from (\n" +
        "    select c.employee_id\n" +
        "    ,CONVERT(count(*), DECIMAL) total\n" +
        "    ,sum(amount) volume\n" +
        "    from claim c\n" +
        "    join user u on u.id = c.employee_id\n" +
        "    where u.role in ('CLAIMER')\n" +
        `    and DATE(c.reqtime) between date('${params.fromdate}') and date('${params.todate}')\n`

      if (params && params.status) {
        sql += `and c.status = '${params.status}'\n`
      }

      if (req.user.role === "CLAIMER") {
        sql += `and u.id = '${req.user.id}'\n`
      }

      sql += "group by c.employee_id\n" +
        ") a\n" +
        "join user b on b.id = a.employee_id"
    }

    const report = await prisma.$queryRawUnsafe(sql)

    if (!report) {
      return res.status(404).send({
        message: "Staff report not found",
      });
    }

    return res.send(report)

  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

router.get("/customer", async (req, res) => {
  const params = req.query
  try {
    let sql = "select a.*, concat(u.firstname, ' ', u.lastname) user, u.phone, u.email, u.countrycode, c.nicename countryname from (\n" +
      "select u.id\n" +
      ",sum(IF(ct.id is not null, 1, 0)) order_total\n" +
      ",sum(IF(ct.id is not null, ifnull(ct.amount, 0), 0)) order_volume\n" +
      ",sum(IF(cl.id is not null, 1, 0)) claim_total\n" +
      ",sum(IF(cl.id is not null, ifnull(cl.amount, 0), 0)) claim_volume\n" +
      "from user u\n" +
      "join certificate ct on u.id = ct.user_id\n" +
      `                                and DATE(ct.createdtime) between date('${params.fromdate}') and date('${params.todate}')\n`
    if (params && params.status) {
      sql += `and ct.status = '${params.status}'\n`
    }
    sql += "left join claim cl on u.id = cl.user_id\n" +
      `                          and DATE(cl.reqtime) between date('${params.fromdate}') and date('${params.todate}')\n`
    if (params && params.status) {
      sql += `and cl.status = '${params.status}'\n`
    }
    sql += "where u.role in ('USER')\n"
    if (params && params.country) {
      sql += `and u.countrycode = '${params.country}'\n`
    }
    sql += "group by u.id\n" +
      ") a\n" +
      "join user u on u.id = a.id\n"+
      "join country c on c.iso = u.countrycode\n"

    const report = await prisma.$queryRawUnsafe(sql)
    if (!report) {
      return res.status(404).send({
        message: "Customer report not found",
      });
    }

    return res.send(report)
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
})

module.exports = router;