const { authLimiter, generalLimiter } = require("../middlewares/limiter");
const authRoutes = require("./authRoutes");
const reportesRoutes = require("./reportesRoutes");
const manifiestoRoutes = require("./manifiestoRoutes");

function setRoutes(app) {
  app.use("/api/v1/auth", authLimiter, authRoutes);
  app.use("/api/v1/manifiesto", [generalLimiter], manifiestoRoutes);
  app.use("/api/v1/reportes", [generalLimiter], reportesRoutes);

  // Add more routes as needed
}

module.exports = { setRoutes };
