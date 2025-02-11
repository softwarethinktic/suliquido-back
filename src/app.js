const express = require("express");
const { setRoutes } = require("./routes/index");
const { logger } = require("./utils/logger");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
setRoutes(app);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);

});
