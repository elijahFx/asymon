require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const monopolyEventsRoutes = require("./routes/monopolyEvents");
const jungleEventsRoutes = require("./routes/jungleEvents");
const bunkerEventsRoutes = require("./routes/bunkerEvents");
const waitingsRoutes = require("./routes/waitings")
const viewsRoutes = require("./routes/views")
const smsRoutes = require("./routes/sms")

app.use("/users", userRoutes);
app.use("/monopoly", monopolyEventsRoutes);
app.use("/jungle", jungleEventsRoutes);
app.use("/bunker", bunkerEventsRoutes);
app.use("/waitings", waitingsRoutes);
app.use("/views", viewsRoutes);
app.use("/sms", smsRoutes)

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
    return;
  }
  console.log("Подключение к базе данных успешно");
});

app.listen(process.env.PORT, () => {
  console.log(`Сервер запущен на порте ${process.env.PORT}`);
});

module.exports = db;
