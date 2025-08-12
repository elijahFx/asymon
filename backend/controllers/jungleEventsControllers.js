const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

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
      additionalTimeWithHost
    } = req.body;

    // Проверка на пересечение времен
    const [existingEvents] = await connection.execute(
      `SELECT id, start, end FROM jungle_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?) OR
         (start >= ? AND end <= ?)
       )`,
      [date, end, start, start, end, start, end]
    );

    if (existingEvents.length > 0) {
      return res.status(400).json({
        success: false,
        message: "на это время уже есть запись в Джуманджи",
      });
    }

    // Проверка 30-минутных буферов
    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);
    const bufferStart = new Date(startTime.getTime() - 29 * 60000)
      .toISOString()
      .substr(11, 8);
    const bufferEnd = new Date(endTime.getTime() + 29 * 60000)
      .toISOString()
      .substr(11, 8);

    const [bufferConflicts] = await connection.execute(
      `SELECT id FROM jungle_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?)
       )`,
      [date, start, bufferStart, bufferEnd, end]
    );

    if (bufferConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "требуется 30-минутный перерыв до и после мероприятия в Джуманджи",
      });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO jungle_events (
        id, createdAt, date, start, end, status, phoneNumber, consumerName,
        messenger, messengerNickname, isAmeteur, isPaid, user_id,
        childrenTariff, childrenAmount, peopleAmount, wishes,
        peopleTariff, discount, prepayment,
        isBirthday, isExtr, childPlan, childAge, additionalTime, adultsWithChildrenAmount, additionalTimeWithHost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        isBirthday || false,
        isExtr || false,
        childPlan,
        childAge,
        additionalTime,
        adultsWithChildrenAmount,
        additionalTimeWithHost
      ]
    );

    res.status(201).json({
      success: true,
      id,
      message: "Мероприятие в Джуманджи успешно добавлено",
    });
  } catch (error) {
    console.error("Error adding jungle event:", error);
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
    const { date, start, end } = req.body;

    if (date || start || end) {
      const [currentEvent] = await connection.execute(
        "SELECT date, start, end FROM jungle_events WHERE id = ?",
        [id]
      );

      if (!currentEvent.length) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      const finalDate = date || currentEvent[0].date;
      const finalStart = start || currentEvent[0].start;
      const finalEnd = end || currentEvent[0].end;

      const [existingEvents] = await connection.execute(
        `SELECT id FROM jungle_events 
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

      if (existingEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: "на это время уже есть другая запись в Джуманджи",
        });
      }

      const startTime = new Date(`${finalDate}T${finalStart}`);
      const endTime = new Date(`${finalDate}T${finalEnd}`);
      const bufferStart = new Date(startTime.getTime() - 29 * 60000)
        .toISOString()
        .substr(11, 8);
      const bufferEnd = new Date(endTime.getTime() + 29 * 60000)
        .toISOString()
        .substr(11, 8);

      const [bufferConflicts] = await connection.execute(
        `SELECT id FROM jungle_events 
         WHERE date = ? AND id != ? AND (
           (start < ? AND end > ?) OR
           (start < ? AND end > ?)
         )`,
        [finalDate, id, finalStart, bufferStart, bufferEnd, finalEnd]
      );

      if (bufferConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "требуется 30-минутный перерыв до и после мероприятия в Джуманджи",
        });
      }
    }

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
      "additionalTimeWithHost"
    ];

    const updates = fields
      .filter((field) => field in req.body)
      .map((field) => `${field} = ?`)
      .join(", ");

      console.log(updates)

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
      `UPDATE jungle_events SET ${updates} WHERE id = ?`,
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
      message: "Мероприятие в Джуманджи успешно обновлено",
    });
  } catch (error) {
    console.error("Error updating jungle event:", error);
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
