module.exports={
    username: process.env.DB_USERNAME ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    host: process.env.DB_HOST ,
    dialect: "mysql", // Change to "postgres", "sqlite", or "mssql" as needed
}