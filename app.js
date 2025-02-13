require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const dbConnection = require("./src/config/connectionDb");
const { setRoutes } = require("./src/routes");
const { logger } = require("./src/utils/logger");

const app = express();

dbConnection();
const PORT = process.env.PORT || 3000;
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// create a write stream (in append mode)
console.error(process.env.NODE_ENV);
 
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Set up routes
setRoutes(app);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
