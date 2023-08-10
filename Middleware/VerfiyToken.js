const jwt = require("jsonwebtoken");

//configuration
const config = "@!@!@!@!@!@!@!@!@123";

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config);
    if (decoded.IsVerify == false) {
      res.status(401).json({
        message: "User is not Verfied",
        data: null,
        role: "null",
        IsVerify: false,
      });
    }
    req.userId = decoded.Id;
    req.uqId = decoded.uqId;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.log("error decoding ", err);
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyToken;
