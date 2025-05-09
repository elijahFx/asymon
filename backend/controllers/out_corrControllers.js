const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получить все записи исходящей корреспонденции
const getAllOutGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const [rows] = await connection.execute(
      `SELECT 
        number,
        id, 
        createdAt, 
        toWho, 
        case_num, 
        user_id, 
        summary,
        responsibleEmployee
       FROM out_cors 
       ORDER BY createdAt DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Ошибка при получении исходящей корреспонденции:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получить одну запись по ID
const getSingleOutGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT 
        number,
        id, 
        createdAt, 
        toWho, 
        case_num, 
        user_id, 
        summary,
        responsibleEmployee
       FROM out_cors 
       WHERE id = ?`,
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
const addOutGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { toWho, case_num, user_id, summary, responsibleEmployee } = req.body;

    if (!toWho || !case_num || !user_id) {
      return res.status(400).json({ error: "Обязательные поля: toWho, case_num, user_id" });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO out_cors 
       (id, createdAt, toWho, case_num, user_id, summary, responsibleEmployee) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, createdAt, toWho, case_num, user_id, summary, responsibleEmployee || null]
    );

    // Возвращаем полную созданную запись
    const [newRecord] = await connection.execute(
      `SELECT * FROM out_cors WHERE id = ?`,
      [id]
    );

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error("Ошибка при добавлении:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновить запись (PATCH)
const updateOutGoing = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const { toWho, case_num, user_id, summary } = req.body;

    if (!toWho && !case_num && !user_id && !summary) {
      return res.status(400).json({ error: "Хотя бы одно поле должно быть заполнено" });
    }

    const fieldsToUpdate = [];
    const values = [];

    if (toWho) {
      fieldsToUpdate.push("toWho = ?");
      values.push(toWho);
    }
    if (case_num) {
      fieldsToUpdate.push("case_num = ?");
      values.push(case_num);
    }
    if (user_id) {
      fieldsToUpdate.push("user_id = ?");
      values.push(user_id);
    }
    if (summary) {
      fieldsToUpdate.push("summary = ?");
      values.push(summary);
    }

    values.push(id);

    const query = `UPDATE out_cors SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    
    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Запись не найдена" });
    }

    // Возвращаем обновленную запись
    const [updatedRecord] = await connection.execute(
      `SELECT * FROM out_cors WHERE id = ?`,
      [id]
    );

    res.status(200).json(updatedRecord[0]);
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAllOutGoing,
  getSingleOutGoing,
  addOutGoing,
  updateOutGoing,
};