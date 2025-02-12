require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dbConnection = require("./config/connectionDb");
const { setRoutes } = require("./routes");
const { logger } = require("./utils/logger");

const app = express();

dbConnection();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
setRoutes(app);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
