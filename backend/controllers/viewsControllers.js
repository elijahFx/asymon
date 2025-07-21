const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение всех просмотров
const getAllViews = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const [rows] = await connection.execute(
      `SELECT * FROM views ORDER BY createdAt DESC`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получение одного просмотра по ID
const getViewById = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM views WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "View not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching view:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Создание нового просмотра
const addView = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      user_id,
      date,
      time,
      name,
      phone,
      note,
      location
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO views (
        id, user_id, createdAt, date, time, name, phone, note, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        createdAt,
        date,
        time,
        name,
        phone,
        note || null,
        location
      ]
    );

    res.status(201).json({
      success: true,
      id,
      message: "Просмотр успешно добавлен",
    });
  } catch (error) {
    console.error("Error adding view:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновление просмотра
const updateView = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const fields = [
      "user_id",
      "date",
      "time",
      "name",
      "phone",
      "note",
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
      `UPDATE views SET ${updates} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "View not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Просмотр успешно обновлен",
    });
  } catch (error) {
    console.error("Error updating view:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление просмотра
const deleteView = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM views WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "View not found" });
    }

    res.status(200).json({ message: "View deleted successfully" });
  } catch (error) {
    console.error("Error deleting view:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAllViews,
  getViewById,
  addView,
  updateView,
  deleteView,
};