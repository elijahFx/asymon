const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение всех обращений по user_id
const getAppealsByUserId = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;


    const [rows] = await connection.execute(
      `SELECT * FROM appeals WHERE user_id = ? ORDER BY createdAt DESC`,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching appeals:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const getAppealById = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    console.log(`Получаем обращение с ID ${id}`);

    const [rows] = await connection.execute(
      `SELECT * FROM appeals WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching appeal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Добавление нового обращения
const addAppeal = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      employee,
      consumerFullName,
      summary,
      controlDate,
      status,
      footnote,
      consumerPhone,
      user_id,
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO appeals 
       (id, createdAt, employee, consumerFullName, summary, controlDate, status, footnote, consumerPhone, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createdAt,
        employee,
        consumerFullName,
        summary,
        controlDate,
        status,
        footnote,
        consumerPhone,
        user_id,
      ]
    );

    res.status(201).json({
      id,
      message: "Appeal added successfully",
    });
  } catch (error) {
    console.error("Error adding appeal:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновление обращения (PATCH)
const updateAppeal = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const { consumerFullName, summary, controlDate, status, footnote } =
      req.body;

    const [result] = await connection.execute(
      `UPDATE appeals SET 
       consumerFullName = COALESCE(?, consumerFullName),
       summary = COALESCE(?, summary),
       controlDate = COALESCE(?, controlDate),
       status = COALESCE(?, status),
       footnote = COALESCE(?, footnote)
       WHERE id = ?`,
      [consumerFullName, summary, controlDate, status, footnote, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.status(200).json({ message: "Appeal updated successfully" });
  } catch (error) {
    console.error("Error updating appeal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление обращения
const deleteAppeal = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM appeals WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Appeal not found" });
    }

    res.status(200).json({ message: "Appeal deleted successfully" });
  } catch (error) {
    console.error("Error deleting appeal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAppealsByUserId,
  addAppeal,
  updateAppeal,
  deleteAppeal,
  getAppealById
};
