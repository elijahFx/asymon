const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const requireAuth = require("../requireAuth");

const router = express.Router();

// Обработка запроса: динамическая директория загрузки
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.query.caseId;
    console.log("caseId from query:", caseId);

    // Указываем путь, который находится на два уровня выше папки 'routes'
    const dir = path.join(__dirname, "../../files/Cases", `Case[id-${caseId}]`);
    // Создаем папку, если она не существует
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Файл не получен" });

  res.status(200).json({
    message: "Файл успешно загружен",
    filePath: `/files/Cases/Case[id-${req.query.caseId}]/${req.file.filename}`, // Обновлен путь
  });
});

router.get("/", requireAuth, (req, res) => {
  const caseId = req.query.caseId;

  if (!caseId) {
    return res.status(400).json({ message: "Не передан caseId" });
  }

  const dirPath = path.join(
    __dirname,
    "../../files/Cases",
    `Case[id-${caseId}]`
  );

  if (!fs.existsSync(dirPath)) {
    return res.status(200).json({ files: [] });
  }

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Ошибка при чтении папки:", err);
      return res.status(500).json({ message: "Ошибка при чтении файлов" });
    }

    const fileInfos = files.map((filename) => {
      const fullPath = path.join(dirPath, filename);
      const stats = fs.statSync(fullPath);

      return {
        name: filename,
        size: stats.size, // в байтах
        createdAt: stats.birthtime, // можно также использовать stats.ctime
        url: `/files/Cases/Case[id-${caseId}]/${filename}`,
      };
    });

    res.status(200).json({ files: fileInfos });
  });
});

router.get("/download/Cases/Case\\[id-:caseId\\]/:fileName", requireAuth, (req, res) => {
  const { caseId, fileName } = req.params;

  const filePath = path.join(
    __dirname,
    "../../files/Cases",
    `Case[id-${caseId}]`,
    fileName
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Файл не найден" });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Ошибка при скачивании файла:", err);
      res.status(500).send("Ошибка при скачивании файла");
    }
  });
});

module.exports = router;
