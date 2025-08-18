const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");
const { getEventTableByLocation, checkScheduleConflicts } = require("../utils/utils_mini");

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
    const { user_id, date, start, end, name, phone, note, location } = req.body;

    // Проверка на конфликты в расписании
    const eventTable = getEventTableByLocation(location);
    const conflictEvents = await checkScheduleConflicts(connection, eventTable, date, start, end, location);

    if (conflictEvents.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Конфликт расписания",
        conflicts: conflictEvents,
        message: `В выбранное время уже есть мероприятие в ${location} или оно слишком близко к другому мероприятию (минимум 30 минут между событиями). Пожалуйста, выберите другое время.`,
      });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO views (
        id, user_id, createdAt, date, start, end, name, phone, note, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        createdAt,
        date,
        start,
        end,
        name,
        phone,
        note || null,
        location,
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

const updateView = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const fields = [
      "user_id",
      "date",
      "start",
      "end",
      "name",
      "phone",
      "note",
      "location",
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

    // Проверка на конфликты в расписании, если обновляются date, start, end или location
    if (req.body.date || req.body.start || req.body.end || req.body.location) {
      // Получаем текущие или новые значения
      const [currentView] = await connection.execute(
        `SELECT date, start, end, location FROM views WHERE id = ?`,
        [id]
      );

      const date = req.body.date || currentView[0].date;
      const start = req.body.start || currentView[0].start;
      const end = req.body.end || currentView[0].end;
      const location = req.body.location || currentView[0].location;

      const eventTable = getEventTableByLocation(location);
      const conflictEvents = await checkScheduleConflicts(
        connection, 
        eventTable, 
        date, 
        start, 
        end, 
        location, 
        id // Исключаем текущее событие из проверки
      );

      if (conflictEvents.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Конфликт расписания",
          conflicts: conflictEvents,
          message: `В выбранное время уже есть мероприятие в ${location} или оно слишком близко к другому мероприятию (минимум 30 минут между событиями). Пожалуйста, выберите другое время.`,
        });
      }
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
