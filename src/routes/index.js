const authRoutes = require('./authRoutes');
const manifiestoRoutes = require('./manifiestoRoutes');

function setRoutes(app) {
    
  app.use("/api/v1/auth" ,  authRoutes);
  app.use("/api/v1/manifiesto", manifiestoRoutes);

  // Add more routes as needed
}

module.exports = { setRoutes };
