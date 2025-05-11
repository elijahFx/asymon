const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получение всех событий
const getAllEvents = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const [rows] = await connection.execute(
      `SELECT * FROM jungle_events ORDER BY createdAt DESC`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получение одного события по ID
const getEventById = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM jungle_events WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Создание нового события
const addEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      date,
      start,
      end,
      status,
      phoneNumber,
      consumerName,
      messenger,
      messengerNickname,
      isAmeteur,
      user_id,
      childrenTariff,
      childrenAmount,
      peopleAmount,
      wishes,
      peopleTariff,
      discount,
      prepayment,
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO jungle_events (
        id, createdAt, date, start, end, status, phoneNumber, consumerName,
        messenger, messengerNickname, isAmeteur, user_id,
        childrenTariff, childrenAmount, peopleAmount, wishes,
        peopleTariff, discount, prepayment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, createdAt, date, start, end, status, phoneNumber, consumerName,
        messenger, messengerNickname, isAmeteur, user_id,
        childrenTariff, childrenAmount, peopleAmount, wishes,
        peopleTariff, discount, prepayment
      ]
    );

    res.status(201).json({
      id,
      message: "Event added successfully",
    });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Обновление события
const updateEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const fields = [
      "date", "start", "end", "status", "phoneNumber", "consumerName",
      "messenger", "messengerNickname", "isAmeteur", "childrenTariff",
      "childrenAmount", "peopleAmount", "wishes", "peopleTariff",
      "discount", "prepayment"
    ];

    const updates = fields
      .filter(field => field in req.body)
      .map(field => `${field} = ?`)
      .join(", ");

    const values = fields
      .filter(field => field in req.body)
      .map(field => req.body[field]);

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const [result] = await connection.execute(
      `UPDATE jungle_events SET ${updates} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

// Удаление события
const deleteEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [result] = await connection.execute(
      `DELETE FROM jungle_events WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
};
