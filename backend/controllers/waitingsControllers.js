const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение всех записей ожидания
const getAllWaitings = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const [rows] = await connection.execute(
      `SELECT * FROM waitings ORDER BY createdAt DESC`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching waitings:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получение одной записи ожидания по ID
const getWaitingById = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM waitings WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Waiting not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching waiting:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Создание новой записи ожидания
const addWaiting = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      user_id,
      date,
      name,
      phone,
      location
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO waitings (
        id, user_id, createdAt, date, name, phone, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        createdAt,
        date,
        name,
        phone,
        location
      ]
    );

    res.status(201).json({
      success: true,
      id,
      message: "Запись ожидания успешно добавлена",
    });
  } catch (error) {
    console.error("Error adding waiting:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновление записи ожидания
const updateWaiting = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const fields = [
      "user_id",
      "date",
      "name",
      "phone",
      "location"
    ];

    const updates = fields
      .filter((field) => field in req.body)
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = fields
      .filter((field) => field in req.body)
      .map((field) => req.body[field]);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(id);

    const [result] = await connection.execute(
      `UPDATE waitings SET ${updates} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Waiting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Запись ожидания успешно обновлена",
    });
  } catch (error) {
    console.error("Error updating waiting:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление записи ожидания
const deleteWaiting = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM waitings WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Waiting not found" });
    }

    res.status(200).json({ message: "Waiting deleted successfully" });
  } catch (error) {
    console.error("Error deleting waiting:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAllWaitings,
  getWaitingById,
  addWaiting,
  updateWaiting,
  deleteWaiting,
};