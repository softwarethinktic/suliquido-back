const { authLimiter, generalLimiter } = require("../middlewares/limiter");
const { validateApiToken } = require("../middlewares/validateJWT");
const authRoutes = require("./authRoutes");
const manifiestoRoutes = require("./manifiestoRoutes");

function setRoutes(app) {
  app.use("/auth", authLimiter, authRoutes);
  app.use("/manifiesto", [ generalLimiter, validateApiToken], manifiestoRoutes);

  // Add more routes as needed
}

module.exports = { setRoutes };
