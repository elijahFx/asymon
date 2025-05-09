const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

require("dotenv").config();

const addNote = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const { user_id, case_id, text } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const [result] = await connection.execute(
      `INSERT INTO notes 
      (user_id, id, case_id, text, createdAt) 
      VALUES (?, ?, ?, ?, ?)`,
      [user_id, id, case_id, text, createdAt]
    );

    res.status(201).json({
      id,
      message: "Note created successfully",
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

const getNotes = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const [rows] = await connection.execute(`
      SELECT * 
      FROM notes 
      ORDER BY createdAt DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const getNotesByCaseId = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    console.log(id);
    

    const [rows] = await connection.execute(
      `SELECT * FROM notes WHERE case_id = ? 
       ORDER BY createdAt DESC`,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching notes by case_id:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const getSingleNote = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM notes WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const editNote = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const { text } = req.body;

    const [result] = await connection.execute(
      `UPDATE notes 
      SET text = ? 
      WHERE id = ?`,
      [text, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const deleteNote = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM notes WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  addNote,
  getNotes,
  getNotesByCaseId,
  getSingleNote,
  editNote,
  deleteNote,
};