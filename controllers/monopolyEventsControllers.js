const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");
const { adjustTime } = require("../utils/utils_mini");

const getAllEvents = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    // Получаем события отдельно
    const [monopolyEvents] = await connection.execute(
      `SELECT * FROM monopoly_events ORDER BY createdAt DESC`
    );

    // Получаем просмотры отдельно
    const [views] = await connection.execute(
      `SELECT * FROM views WHERE location = 'Монополия' ORDER BY createdAt DESC`
    );

     const [waitings] = await connection.execute(
      `SELECT * FROM waitings WHERE location = 'Монополия' ORDER BY createdAt DESC`
    );

    // Объединяем результаты на уровне JavaScript
    const combinedResults = [...monopolyEvents, ...views, ...waitings].sort(
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
      additionalTimeWithHost,
      additionalTimeWithLabubu,
      silverTime,
    } = req.body;

    
    console.log(JSON.stringify(req.body));

    // 1. Проверка пересечений в monopoly_events
    const [monopolyConflicts] = await connection.execute(
      `SELECT id FROM monopoly_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?) OR
         (start >= ? AND end <= ?)
       )`,
      [date, end, start, start, end, start, end]
    );

    if (monopolyConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "На это время уже есть запись в Монополии",
      });
    }

    // 2. Проверка 29-минутных буферов для monopoly_events
    const bufferStart = adjustTime(start, -29);
    const bufferEnd = adjustTime(end, 29);

    const [monopolyBufferConflicts] = await connection.execute(
      `SELECT id FROM monopoly_events 
       WHERE date = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?)
       )`,
      [date, start, bufferStart, bufferEnd, end]
    );

    if (monopolyBufferConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Требуется 30-минутный перерыв до и после мероприятия",
      });
    }

    // Создание записи
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO monopoly_events (
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
        isBirthday || false,
        isExtr || false,
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

const updateEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const bodyUpdates = req.body;

    // Если обновляются время или дата - проверяем доступность
    if (bodyUpdates.date || bodyUpdates.start || bodyUpdates.end) {
      const [current] = await connection.execute(
        "SELECT date, start, end FROM monopoly_events WHERE id = ?",
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

      // 1. Проверка пересечений в monopoly_events
      const [monopolyConflicts] = await connection.execute(
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

      if (monopolyConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "На это время уже есть другая запись в Монополии",
        });
      }

      // 2. Проверка буферов
      const bufferStart = adjustTime(finalStart, -29);
      const bufferEnd = adjustTime(finalEnd, 29);

      const [monopolyBufferConflicts] = await connection.execute(
        `SELECT id FROM monopoly_events 
         WHERE date = ? AND id != ? AND (
           (start < ? AND end > ?) OR
           (start < ? AND end > ?)
        )`,
        [finalDate, id, finalStart, bufferStart, bufferEnd, finalEnd]
      );

      if (monopolyBufferConflicts.length > 0) {
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
      `UPDATE monopoly_events SET ${setClauses.join(", ")} WHERE id = ?`,
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
    console.error("Error updating monopoly event:", error);
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

    const [viewsEvents] = await connection.execute(
      `SELECT *, 'views' as type FROM views ORDER BY createdAt DESC`
    );

    // Объединяем все события в один массив
    const allEvents = [
      ...monopolyEvents,
      ...jungleEvents,
      ...bunkerEvents,
      ...viewsEvents,
    ];

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
