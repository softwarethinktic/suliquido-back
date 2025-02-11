const authRoutes = require('./authRoutes');


function setRoutes(app) {
    
  app.use("/api/v1/auth", authRoutes);

  // Add more routes as needed
}

module.exports = { setRoutes };
