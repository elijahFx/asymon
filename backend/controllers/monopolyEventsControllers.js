const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

const getAllEvents = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const [rows] = await connection.execute(
      `SELECT * FROM monopoly_events ORDER BY createdAt DESC`
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
      `SELECT * FROM monopoly_events WHERE id = ? LIMIT 1`,
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
    } = req.body;

    const [existingEvents] = await connection.execute(
      `SELECT id, start, end FROM monopoly_events 
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
        message: "на это время уже есть запись в Монополии",
      });
    }

    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);
    const bufferStart = new Date(startTime.getTime() - 30 * 60000)
      .toISOString()
      .substr(11, 8);
    const bufferEnd = new Date(endTime.getTime() + 30 * 60000)
      .toISOString()
      .substr(11, 8);

    const [bufferConflicts] = await connection.execute(
      `SELECT id FROM monopoly_events 
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
          "требуется 30-минутный перерыв до и после мероприятия в Монополии",
      });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO monopoly_events (
        id, createdAt, date, start, end, status, phoneNumber, consumerName,
        messenger, messengerNickname, isAmeteur, isPaid, user_id,
        childrenTariff, childrenAmount, peopleAmount, wishes,
        peopleTariff, discount, prepayment, isBirthday, isExtr, childPlan, childAge,
        additionalTime, adultsWithChildrenAmount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    res.status(201).json({
      success: true,
      id,
      message: "Мероприятие в Монополии успешно добавлено",
    });
  } catch (error) {
    console.error("Error adding monopoly event:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
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
    const { date, start, end } = req.body;

    if (date || start || end) {
      const [currentEvent] = await connection.execute(
        "SELECT date, start, end FROM monopoly_events WHERE id = ?",
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
        `SELECT id FROM monopoly_events 
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
          message: "на это время уже есть другая запись в Монополии",
        });
      }

      const startTime = new Date(`${finalDate}T${finalStart}`);
      const endTime = new Date(`${finalDate}T${finalEnd}`);
      const bufferStart = new Date(startTime.getTime() - 30 * 60000)
        .toISOString()
        .substr(11, 8);
      const bufferEnd = new Date(endTime.getTime() + 30 * 60000)
        .toISOString()
        .substr(11, 8);

      const [bufferConflicts] = await connection.execute(
        `SELECT id FROM monopoly_events 
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
            "требуется 30-минутный перерыв до и после мероприятия в Монополии",
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
      `UPDATE monopoly_events SET ${updates} WHERE id = ?`,
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
      message: "Мероприятие в Монополии успешно обновлено",
    });
  } catch (error) {
    console.error("Error updating event:", error);
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
      `DELETE FROM monopoly_events WHERE id = ?`,
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

const getEventsFromAll = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    // Выполняем запросы к каждой таблице
    const [monopolyEvents] = await connection.execute(
      `SELECT *, 'monopoly' as type FROM monopoly_events ORDER BY createdAt DESC`
    );

    const [jungleEvents] = await connection.execute(
      `SELECT *, 'jungle' as type FROM jungle_events ORDER BY createdAt DESC`
    );

    const [bunkerEvents] = await connection.execute(
      `SELECT *, 'bunker' as type FROM bunker_events ORDER BY createdAt DESC`
    );

    // Объединяем все события в один массив
    const allEvents = [...monopolyEvents, ...jungleEvents, ...bunkerEvents];

    // Сортируем по дате создания (новые сначала)
    allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allEvents);
  } catch (error) {
    console.error("Error fetching all events:", error);
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
  getEventsFromAll,
};
