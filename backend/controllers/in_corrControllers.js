const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получить все записи входящей корреспонденции
const getAllInGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const [rows] = await connection.execute(
      `SELECT * FROM in_cors ORDER BY createdAt DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Ошибка при получении входящей корреспонденции:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получить одну запись по ID
const getSingleInGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM in_cors WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Запись не найдена" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Ошибка при получении записи:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Добавить новую запись
const addInGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { dateAndNum, caseNum, user_id, fromWho, responsibleEmployee, summary } =
      req.body;

    if (
      !dateAndNum ||
      !caseNum ||
      !user_id ||
      !fromWho ||
      !responsibleEmployee,
      !summary
    ) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO in_cors 
       (id, createdAt, dateAndNum, caseNum, user_id, fromWho, responsibleEmployee, summary) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createdAt,
        dateAndNum,
        caseNum,
        user_id,
        fromWho,
        responsibleEmployee,
        summary
      ]
    );

    res.status(201).json({ id, message: "Запись успешно добавлена" });
  } catch (error) {
    console.error("Ошибка при добавлении:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновить запись (использует PATCH вместо PUT)
const updateInGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const { dateAndNum, caseNum, user_id, fromWho } = req.body;

    // Для PATCH не все поля обязательны
    if (!dateAndNum && !caseNum && !user_id && !fromWho) {
      return res
        .status(400)
        .json({ error: "Хотя бы одно поле должно быть заполнено" });
    }

    // Динамическое построение запроса для PATCH
    const fieldsToUpdate = [];
    const values = [];

    if (dateAndNum) {
      fieldsToUpdate.push("dateAndNum = ?");
      values.push(dateAndNum);
    }
    if (caseNum) {
      fieldsToUpdate.push("caseNum = ?");
      values.push(caseNum);
    }
    if (user_id) {
      fieldsToUpdate.push("user_id = ?");
      values.push(user_id);
    }
    if (fromWho) {
      fieldsToUpdate.push("fromWho = ?");
      values.push(fromWho);
    }

    values.push(id); // Добавляем ID в конец для WHERE

    const query = `UPDATE in_cors SET ${fieldsToUpdate.join(
      ", "
    )} WHERE id = ?`;

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Запись не найдена" });
    }

    res.status(200).json({ message: "Запись успешно обновлена" });
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAllInGoing,
  getSingleInGoing, // Экспортируем новый контроллер
  addInGoing,
  updateInGoing,
};
