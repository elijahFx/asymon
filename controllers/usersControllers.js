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

    const { password, nickname } = req.body;

    // Проверка обязательных полей
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    // Вставка нового пользователя с фиксированными значениями
    await connection.query(
      `INSERT INTO users (id, password, nickname, createdAt, status, rank, avatar, isVerified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        hashedPassword,
        nickname,
        createdAt,
        "user",
        "Сотрудник",
        null,
        false,
      ]
    );

    return res
      .status(201)
      .json({
        message: "Пользователь успешно зарегистрирован. Ожидается верификация.",
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
      "SELECT id, password, nickname, status, avatar, rank, createdAt, isVerified FROM users WHERE nickname = ? LIMIT 1",
      [nickname]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const user = users[0];

    // Проверка верификации
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Аккаунт не верифицирован. Подождите подтверждения." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: "5h",
    });

    const userResponse = {
      id: user.id,
      nickname: user.nickname,
      status: user.status,
      avatar: user.avatar,
      rank: user.rank,
      createdAt: user.createdAt || "нет",
      token,
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

    const { rank, avatar: image, status, nickname } = req.body;

    // 2. Если нечего обновлять
    if (!image && !rank && !status && !nickname) {
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
      "SELECT id, nickname, avatar, status, rank FROM users WHERE id = ? LIMIT 1",
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

async function editUserLikeAdmin(req, res) {
  let connection;

  try {
    // 1. Авторизация
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Требуется авторизация" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const adminId = decoded.id;

    // 2. Данные из тела запроса
    const { id, status, rank, isVerified } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Не указан id пользователя" });
    }

    // 3. Открываем соединение с БД
    connection = await createDbConnection();

    // 4. Проверяем, существует ли пользователь
    const [users] = await connection.query("SELECT id FROM users WHERE id = ? LIMIT 1", [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // 5. Собираем данные для обновления
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (rank !== undefined) updateData.rank = rank;
    if (isVerified !== undefined) updateData.isVerified = isVerified ? 1 : 0;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }

    // 6. Обновляем пользователя
    await connection.query("UPDATE users SET ? WHERE id = ?", [updateData, id]);

    // 7. Получаем обновлённого пользователя
    const [updatedUser] = await connection.query(
      "SELECT id, nickname, status, rank, isVerified FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    return res.status(200).json({ message: "Пользователь обновлён", user: updatedUser[0] });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя админом:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Недействительный токен" });
    }

    return res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}


async function getAllUsers(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    // Получаем всех пользователей, исключая sensitive данные (пароль)
    const [users] = await connection.query(
      "SELECT id, nickname, avatar, status, rank, isVerified, createdAt FROM users"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function deleteSingleUser(req, res) {
  let connection;

  try {
    // 1. Авторизация
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Требуется авторизация" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const adminId = decoded.id;

    // 2. Данные из тела запроса
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Не указан id пользователя" });
    }

    // 3. Открываем соединение с БД
    connection = await createDbConnection();

    // 4. Проверяем, существует ли пользователь
    const [users] = await connection.query("SELECT id FROM users WHERE id = ? LIMIT 1", [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // 5. Удаляем пользователя
    await connection.query("DELETE FROM users WHERE id = ?", [id]);

    return res.status(200).json({ message: "Пользователь успешно удалён" });
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);

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
  getAllUsers,
  editUserLikeAdmin,
  deleteSingleUser
};
