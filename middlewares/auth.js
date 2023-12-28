const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "USER" && Date.now() >= decoded.exp * 1000) {
      return res.status(401).send("Token is expired, Please login again");
    }

    req.user = decoded;
    req.user["id"] = Number(req.user["id"]);
    next();
  } catch (e) {
    logger.error("ERROR", e);
    return res.status(401).send({ message: e });
  }
};

module.exports = auth;
