const createDbConnection = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../utils/cloudinary");

require("dotenv").config();

async function signup(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    const { password, nickname, avatar, status, rank, fullName } = req.body;

    // Валидация обязательных полей
    if (!nickname || !password) {
      return res.status(400).json({ error: "Требуются nickname и пароль" });
    }

    // Проверка существующего пользователя
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE nickname = ? LIMIT 1",
      [nickname]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Пользователь уже существует" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4(); // Генерация UUID
    const createdAt = new Date().toISOString(); // Текущая дата

    // Вставка нового пользователя
    await connection.query(
      "INSERT INTO users (id, password, nickname, createdAt, avatar, status, rank, fullName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        hashedPassword,
        nickname,
        createdAt,
        avatar || null,
        status || "user",
        rank || "",
        fullName,
      ]
    );

    // Создание JWT токена
    const token = jwt.sign({ id: userId }, process.env.SECRET, {
      expiresIn: "5h",
    });

    // Возвращаем данные без хеша пароля
    return res.status(201).json({
      user: {
        id: userId,
        nickname,
        createdAt,
        avatar,
        status,
        rank,
        fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function login(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    const { nickname, password } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({ error: "Требуются nickname и пароль" });
    }

    const [users] = await connection.query(
      "SELECT id, password, nickname, status, avatar, rank, fullName, createdAt FROM users WHERE nickname = ? LIMIT 1",
      [nickname]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    // Кол-во всех дел
    const [caseCountResult] = await connection.query(
      "SELECT COUNT(*) AS count FROM cases WHERE responsibleEmployee = ?",
      [user.fullName]
    );
    const caseCount = caseCountResult[0]?.count || 0;

    // Кол-во дел по каждому из 4 нужных статусов
    const [statusCounts] = await connection.query(
      `SELECT status, COUNT(*) as count
       FROM cases
       WHERE responsibleEmployee = ?
         AND status IN (?, ?, ?, ?)
       GROUP BY status`,
      [
        user.fullName,
        "Новое",
        "Ведется работа по делу",
        "В архиве",
        "Вынесено решение (определение)",
      ]
    );

    // Преобразуем массив результатов в объект вида { "Новое": 5, ... }
    const statusCountMap = {
      "Новое": 0,
      "Ведется работа по делу": 0,
      "В архиве": 0,
      "Вынесено решение (определение)": 0,
    };
    statusCounts.forEach(({ status, count }) => {
      statusCountMap[status] = count;
    });

    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: "5h",
    });

    const userResponse = {
      id: user.id,
      nickname: user.nickname,
      status: user.status,
      avatar: user.avatar,
      rank: user.rank,
      fullName: user.fullName,
      createdAt: user.createdAt || "нет",
      token,
      caseCount,
      caseStatuses: statusCountMap,
    };

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}



async function editUser(req, res) {
  let connection;

  try {
    // 1. Проверка авторизации
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    
    if (!token) return res.status(401).json({ error: "Требуется авторизация" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.id;

    const { fullName, rank, avatar: image, status, nickname } = req.body;

    // 2. Если нечего обновлять
    if (!image && !fullName && !rank && !status && !nickname) {
      return res
        .status(400)
        .json({ error: "Не указаны данные для обновления" });
    }

    connection = await createDbConnection();

    // 3. Если есть новое изображение — загружаем в Cloudinary
    let newAvatarUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "user_avatars",
        transformation: [
          { width: 200, height: 200, crop: "thumb", gravity: "face" },
          { quality: "auto" },
        ],
      });
      newAvatarUrl = uploadResult.secure_url;
    }

    // 4. Обновляем данные пользователя
    const updateData = {
      ...(fullName && { fullName }),
      ...(rank && { rank }),
      ...(status && { status }),
      ...(nickname && { nickname }),
      ...(newAvatarUrl && { avatar: newAvatarUrl }),
    };

    await connection.query("UPDATE users SET ? WHERE id = ?", [
      updateData,
      userId,
    ]);

    // 5. Возвращаем обновлённого пользователя
    const [updatedUser] = await connection.query(
      "SELECT id, nickname, fullName, avatar, status, rank FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    return res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Недействительный токен" });
    }

    return res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = {
  signup,
  login,
  editUser,
};
