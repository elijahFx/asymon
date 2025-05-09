const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

require("dotenv").config();

async function addCase(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    // Получаем данные из тела запроса
    const {
      consumerFullName,
      consumerAddress,
      consumerPhone,
      consumerEmail = null,
      sellerName,
      sellerAddress = null,
      sellerUnp,
      user_id,
      status = null,
      sphere = null,
      case_character = null,
      suiteBy = null,
      claimBy = null,
      appealBy = null,
      opiBy = null,
      responsibleEmployee = null,
    } = req.body;

    // Валидация обязательных полей
    if (
      !consumerFullName ||
      !consumerAddress ||
      !consumerPhone ||
      !sellerName ||
      !sellerUnp ||
      !user_id
    ) {
      return res.status(400).json({
        error:
          "Обязательные поля: consumerFullName, consumerAddress, consumerPhone, sellerName, sellerUnp, user_id",
      });
    }

    // Генерируем уникальный ID для дела
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Вставляем дело в базу данных
    await connection.query(
      `INSERT INTO cases (
          id, consumerFullName, consumerAddress, consumerPhone, consumerEmail,
          sellerName, sellerAddress, sellerUnp, createdAt, user_id,
          status, sphere, case_character, suiteBy, claimBy,
          appealBy, opiBy, responsibleEmployee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        consumerFullName,
        consumerAddress,
        consumerPhone,
        consumerEmail,
        sellerName,
        sellerAddress,
        sellerUnp,
        createdAt,
        user_id,
        status,
        sphere,
        case_character,
        suiteBy,
        claimBy,
        appealBy,
        opiBy,
        responsibleEmployee,
      ]
    );

    // Получаем только что созданное дело из базы (чтобы получить автоматически сгенерированный number)
    const [cases] = await connection.query(
      "SELECT * FROM cases WHERE id = ? LIMIT 1",
      [id]
    );

    if (cases.length === 0) {
      return res.status(500).json({ error: "Не удалось создать дело" });
    }

    return res.status(201).json(cases[0]);
  } catch (error) {
    console.error("Ошибка при создании дела:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function getCase(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    // Получаем ID дела из тела запроса
    const { id } = req.params;

    // Валидация - проверяем, что ID был передан
    if (!id) {
      return res.status(400).json({ error: "Необходимо указать ID дела" });
    }

    // Ищем дело в базе данных
    const [cases] = await connection.query(
      "SELECT * FROM cases WHERE number = ? LIMIT 1",
      [id]
    );

    // Если дело не найдено
    if (cases.length === 0) {
      return res.status(404).json({ error: "Дело не найдено" });
    }

    // Возвращаем найденное дело
    return res.status(200).json(cases[0]);
  } catch (error) {
    console.error("Ошибка при получении дела:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function getCases(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    // Получаем все дела из базы данных
    const [cases] = await connection.query(
      "SELECT * FROM cases ORDER BY createdAt DESC"
    );

    // Возвращаем список дел
    return res.status(200).json(cases);
  } catch (error) {
    console.error("Ошибка при получении списка дел:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function editCase(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    const {
      id, // обязательное поле - идентификатор дела
      consumerFullName,
      consumerAddress,
      consumerPhone,
      consumerEmail,
      sellerName,
      sellerAddress,
      sellerUnp,
      status,
      sphere,
      case_character,
      suiteBy,
      claimBy,
      appealBy,
      opiBy,
      responsibleEmployee,
    } = req.body;

    // Валидация - проверяем, что ID дела был передан
    if (!id) {
      return res.status(400).json({ error: "Необходимо указать ID дела" });
    }

    // Проверяем, что есть хотя бы одно поле для обновления
    const updatableFields = {
      consumerFullName,
      consumerAddress,
      consumerPhone,
      consumerEmail,
      sellerName,
      sellerAddress,
      sellerUnp,
      status,
      sphere,
      case_character,
      suiteBy,
      claimBy,
      appealBy,
      opiBy,
      responsibleEmployee,
    };

    // Проверяем, что хотя бы одно поле передано для обновления
    const hasUpdates = Object.values(updatableFields).some(
      (value) => value !== undefined
    );

    if (!hasUpdates) {
      return res.status(400).json({
        error: "Не указаны поля для обновления",
      });
    }

    // Формируем SQL запрос динамически на основе переданных полей
    const updateFields = [];
    const updateValues = [];

    for (const [field, value] of Object.entries(updatableFields)) {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    }

    // Добавляем ID в конец массива значений для WHERE условия
    updateValues.push(id);

    const updateQuery = `
        UPDATE cases 
        SET ${updateFields.join(", ")} 
        WHERE id = ?
      `;

    // Выполняем обновление
    const [result] = await connection.query(updateQuery, updateValues);

    // Проверяем, было ли обновлено хотя бы одно поле
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Дело не найдено или данные не изменились" });
    }

    // Получаем обновленное дело
    const [updatedCases] = await connection.query(
      "SELECT * FROM cases WHERE id = ? LIMIT 1",
      [id]
    );

    return res.status(200).json(updatedCases[0]);
  } catch (error) {
    console.error("Ошибка при обновлении дела:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

async function getShortCases(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    // Получаем только необходимые поля из базы данных
    const [cases] = await connection.query(`
        SELECT 
          number,
          consumerFullName,
          sellerName,
          sphere,
          case_character,
          responsibleEmployee,
          user_id,
          status,
          createdAt,
          id
        FROM cases
        ORDER BY createdAt ASC
      `);

    return res.status(200).json(cases);
  } catch (error) {
    console.error("Ошибка при получении списка дел:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = {
  addCase,
  getCase,
  getCases,
  getShortCases,
  editCase,
};
