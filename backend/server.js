require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());


const userRoutes = require("./routes/users")
const casesRoutes = require("./routes/cases")
const eventsRoutes = require("./routes/events")
const notesRoutes = require("./routes/notes")
const courtVisits = require("./routes/courtVisits")
const in_corrRoutes = require("./routes/in_corr")
const out_corrRoutes = require("./routes/out_corr")
const claimsRoutes = require("./routes/claims")
const appeals = require("./routes/appeals")
const court_decisions = require("./routes/court_decisions")
const uploads = require("./routes/upload")


app.use("/users", userRoutes)
app.use("/cases", casesRoutes)
app.use("/events", eventsRoutes)
app.use("/notes", notesRoutes)
app.use("/court-visits", courtVisits)
app.use("/in_corr", in_corrRoutes)
app.use("/out_corr", out_corrRoutes)
app.use("/claims", claimsRoutes)
app.use("/appeals", appeals)
app.use("/court-decisions", court_decisions)
app.use("/upload", uploads)
app.use("/files", express.static(path.join(__dirname, "../files")));


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
