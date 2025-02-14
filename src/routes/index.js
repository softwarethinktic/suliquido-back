const { authLimiter, generalLimiter } = require("../middlewares/limiter");
const { validateApiToken } = require("../middlewares/validateJWT");
const authRoutes = require("./authRoutes");
const manifiestoRoutes = require("./manifiestoRoutes");

function setRoutes(app) {
  app.use("/api/v1/auth", authLimiter, authRoutes);
  app.use(
    "/api/v1/manifiesto",
    [generalLimiter, validateApiToken],
    manifiestoRoutes
  );

  // Add more routes as needed
}

module.exports = { setRoutes };
