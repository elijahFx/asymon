const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение всех посещений для конкретного дела
const getCourtVisitsByCaseId = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    console.log(`Больной ${id}`);
    

    const [rows] = await connection.execute(
      `SELECT * FROM court_visits WHERE case_id = ? ORDER BY createdAt DESC`,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching court visits:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Добавление нового посещения
const addCourtVisit = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { user_id, employee, type, case_id, date } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO court_visits 
       (id, user_id, employee, type, createdAt, case_id, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, employee, type, createdAt, case_id, date]
    );

    res.status(201).json({ 
      id,
      message: "Court visit added successfully" 
    });
  } catch (error) {
    console.error("Error adding court visit:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление посещения
const deleteCourtVisit = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM court_visits WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Court visit not found" });
    }

    res.status(200).json({ message: "Court visit deleted successfully" });
  } catch (error) {
    console.error("Error deleting court visit:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getCourtVisitsByCaseId,
  addCourtVisit,
  deleteCourtVisit
};