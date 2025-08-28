const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");
const { adjustTime } = require("../utils/utils_mini");

const getAllEvents = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    // Получаем события отдельно
    const [bunkerEvents] = await connection.execute(
      `SELECT * FROM bunker_events ORDER BY createdAt DESC`
    );

    // Получаем просмотры отдельно
    const [views] = await connection.execute(
      `SELECT * FROM views WHERE location = 'Бункер' ORDER BY createdAt DESC`
    );

    // Объединяем результаты на уровне JavaScript
    const combinedResults = [...bunkerEvents, ...views].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(combinedResults);
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
      `SELECT * FROM bunker_events WHERE id = ? LIMIT 1`,
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
      isPaid,
      user_id,
      childrenTariff,
      childrenAmount,
      peopleAmount,
      wishes,
      peopleTariff,
      discount,
      prepayment,
      isBirthday,
      isExtr,
      childPlan,
      childAge,
      additionalTime,
      adultsWithChildrenAmount,
      additionalTimeWithHost,
      additionalTimeWithLabubu,
      silverTime,
    } = req.body;

    console.log(JSON.stringify(req.body));
    

    // 1. Проверка пересечений в bunker_events
    const [bunkerConflicts] = await connection.execute(
      `SELECT id FROM bunker_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?) OR
         (start >= ? AND end <= ?)
       )`,
      [date, end, start, start, end, start, end]
    );

    if (bunkerConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "На это время уже есть запись в Бункере",
      });
    }

    // 2. Проверка 29-минутных буферов для bunker_events
    const bufferStart = adjustTime(start, -29);
    const bufferEnd = adjustTime(end, 29);

    const [bunkerBufferConflicts] = await connection.execute(
      `SELECT id FROM bunker_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?)
       )`,
      [date, start, bufferStart, bufferEnd, end]
    );

    if (bunkerBufferConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Требуется 30-минутный перерыв до и после мероприятия",
      });
    }

    // Создание записи
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO bunker_events (
        id, createdAt, date, start, end, status, phoneNumber, consumerName,
        messenger, messengerNickname, isAmeteur, isPaid, user_id,
        childrenTariff, childrenAmount, peopleAmount, wishes,
        peopleTariff, discount, prepayment,
        isBirthday, isExtr, childPlan, childAge, additionalTime, 
        adultsWithChildrenAmount, additionalTimeWithHost, additionalTimeWithLabubu,
        silverTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createdAt,
        date,
        start,
        end,
        status,
        phoneNumber,
        consumerName,
        messenger,
        messengerNickname,
        isAmeteur,
        isPaid,
        user_id,
        childrenTariff,
        childrenAmount,
        peopleAmount,
        wishes,
        peopleTariff,
        discount,
        prepayment,
        isBirthday,
        isExtr,
        childPlan,
        childAge,
        additionalTime,
        adultsWithChildrenAmount,
        additionalTimeWithHost,
        additionalTimeWithLabubu,
        silverTime,
      ]
    );

    res.status(201).json({
      success: true,
      id,
      message: "Мероприятие в Бункере успешно добавлено",
    });
  } catch (error) {
    console.error("Error adding bunker event:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

const updateEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const bodyUpdates = req.body; // Переименовал, чтобы не путать с массивом updates

    // Если обновляются время или дата - проверяем доступность
    if (bodyUpdates.date || bodyUpdates.start || bodyUpdates.end) {
      const [current] = await connection.execute(
        "SELECT date, start, end FROM bunker_events WHERE id = ?",
        [id]
      );

      if (!current.length) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      const finalDate = bodyUpdates.date || current[0].date;
      const finalStart = bodyUpdates.start || current[0].start;
      const finalEnd = bodyUpdates.end || current[0].end;

      // 1. Проверка пересечений в bunker_events
      const [bunkerConflicts] = await connection.execute(
        `SELECT id FROM bunker_events 
         WHERE date = ? AND id != ? AND (
           (start < ? AND end > ?) OR
           (start < ? AND end > ?) OR
           (start >= ? AND end <= ?)
        )`,
        [
          finalDate,
          id,
          finalEnd,
          finalStart,
          finalStart,
          finalEnd,
          finalStart,
          finalEnd,
        ]
      );

      if (bunkerConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "На это время уже есть другая запись в Бункере",
        });
      }

      // 2. Проверка буферов
      const bufferStart = adjustTime(finalStart, -29);
      const bufferEnd = adjustTime(finalEnd, 29);

      const [bunkerBufferConflicts] = await connection.execute(
        `SELECT id FROM bunker_events 
         WHERE date = ? AND id != ? AND (
           (start < ? AND end > ?) OR
           (start < ? AND end > ?)
        )`,
        [finalDate, id, finalStart, bufferStart, bufferEnd, finalEnd]
      );

      if (bunkerBufferConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Требуется 30-минутный перерыв до и после мероприятия",
        });
      }
    }

    // Подготовка полей для обновления
    const fields = [
      "date",
      "start",
      "end",
      "status",
      "phoneNumber",
      "consumerName",
      "messenger",
      "messengerNickname",
      "isAmeteur",
      "isPaid",
      "childrenTariff",
      "childrenAmount",
      "peopleAmount",
      "wishes",
      "peopleTariff",
      "discount",
      "prepayment",
      "isBirthday",
      "isExtr",
      "childPlan",
      "childAge",
      "additionalTime",
      "adultsWithChildrenAmount",
      "additionalTimeWithHost",
      "additionalTimeWithLabubu",
      "silverTime"
    ];

    const setClauses = [];
    const values = [];

    fields.forEach((field) => {
      if (bodyUpdates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(bodyUpdates[field]);
      }
    });

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(id);

    const [result] = await connection.execute(
      `UPDATE bunker_events SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Мероприятие в Бункере успешно обновлено",
    });
  } catch (error) {
    console.error("Error updating bunker event:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
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
      `DELETE FROM bunker_events WHERE id = ?`,
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
