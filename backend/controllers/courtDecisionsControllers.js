const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение судебных решений (всех или по case_id)
const getCourtDecisions = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    let query = "SELECT * FROM court_decisions";
    const params = [];

    if (id) {
      query += " WHERE case_id = ?";
      params.push(id);
    }

    query += " ORDER BY createdAt DESC";

    const [rows] = await connection.execute(query, params);

    if (id && rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Court decisions not found for this case" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching court decisions:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Добавление нового судебного решения
const addCourtDecision = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      user_id,
      case_id,
      type,
      court,
      date,
      society_expenses,
      society_penalty,
      consumer_money,
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO court_decisions 
       (id, createdAt, user_id, case_id, type, court, date, society_expenses, society_penalty, consumer_money) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createdAt,
        user_id,
        case_id,
        type,
        court,
        date,
        society_expenses,
        society_penalty,
        consumer_money,
      ]
    );

    res.status(201).json({
      id,
      message: "Court decision added successfully",
    });
  } catch (error) {
    console.error("Error adding court decision:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновление судебного решения (PATCH)
const updateCourtDecision = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const {
      case_id,
      type,
      court,
      date,
      society_expenses,
      society_penalty,
      consumer_money,
    } = req.body;

    const [result] = await connection.execute(
      `UPDATE court_decisions SET 
       case_id = COALESCE(?, case_id),
       type = COALESCE(?, type),
       court = COALESCE(?, court),
       date = COALESCE(?, date),
       society_expenses = COALESCE(?, society_expenses),
       society_penalty = COALESCE(?, society_penalty),
       consumer_money = COALESCE(?, consumer_money)
       WHERE id = ?`,
      [
        case_id,
        type,
        court,
        date,
        society_expenses,
        society_penalty,
        consumer_money,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Court decision not found" });
    }

    res.status(200).json({ message: "Court decision updated successfully" });
  } catch (error) {
    console.error("Error updating court decision:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление судебного решения
const deleteCourtDecision = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM court_decisions WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Court decision not found" });
    }

    res.status(200).json({ message: "Court decision deleted successfully" });
  } catch (error) {
    console.error("Error deleting court decision:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getCourtDecisions,
  addCourtDecision,
  updateCourtDecision,
  deleteCourtDecision,
};
