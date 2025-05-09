const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

require("dotenv").config();

const addEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    const {
      user_id,
      type,
      color,
      date,
      time,
      responsibleEmployee,
      court,
      case_num,
    } = req.body;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const [result] = await connection.execute(
      `INSERT INTO events 
      (user_id, id, createdAt, type, color, date, time, responsibleEmployee, court, case_num) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        id,
        createdAt,
        type,
        color,
        date,
        time,
        responsibleEmployee,
        court,
        case_num,
      ]
    );

    res.status(201).json({
      id,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: error });
  } finally {
    if (connection) await connection.end();
  }
};

const getEvents = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();

    // Получаем все события, сортированные по createdAt
    const [events] = await connection.execute(`
      SELECT * 
      FROM events 
      ORDER BY createdAt DESC
    `);

    // Для событий с case_num подтягиваем данные из cases
    const enhancedEvents = await Promise.all(
      events.map(async (event) => {
        if (event.case_num) {
          const [cases] = await connection.execute(
            `
            SELECT consumerFullName, sellerName
            FROM cases
            WHERE number = ?
            LIMIT 1
            `,
            [event.case_num]
          );

          if (cases.length > 0) {
            const caseData = cases[0];
            return {
              ...event,
              consumerFullName: caseData.consumerFullName,
              sellerName: caseData.sellerName,
            };
          }
        }
        return event;
      })
    );

    res.status(200).json(enhancedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const getEventsByDate = async (req, res) => {
  let connection;
  try {
    const { date } = req.query; // Ожидаем формат "дд.мм.гггг"
    if (!date) {
      return res.status(400).json({ error: "Дата не передана" });
    }

    // Конвертация даты из "дд.мм.гггг" в "гггг-мм-дд"
    const [day, month, year] = date.split(".");
    const formattedDate = `${year}-${month}-${day}`;

    connection = await createDbConnection();

    // Сначала получаем все события на нужную дату
    const [events] = await connection.execute(
      `
      SELECT * 
      FROM events 
      WHERE date = ?
      ORDER BY createdAt DESC
      `,
      [formattedDate]
    );

    // Теперь для событий с case_num подтягиваем доп. данные
    const enhancedEvents = await Promise.all(
      events.map(async (event) => {
        console.log(event);
        
        if (event.case_num) {
          const [cases] = await connection.execute(
            `
            SELECT consumerFullName, sellerName
            FROM cases
            WHERE number = ?
            LIMIT 1
            `,
            [event.case_num]
          );

          console.log(cases);
          

          if (cases.length > 0) {
            const caseData = cases[0];
            return {
              ...event,
              consumerFullName: caseData.consumerFullName,
              sellerName: caseData.sellerName,
            };
          }
        }
        // Если case_num нет или не найдено дело, возвращаем событие как есть
        return event;
      })
    );

    res.status(200).json(enhancedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

const getSingleEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection(); // Добавлен await
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM events WHERE id = ?`, // Исправлен SQL-запрос
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" }); // Проверка на существование
    }

    res.status(200).json(rows[0]); // Отправка найденного события
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const editEvent = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;
    const { date, time, responsibleEmployee, court, case_num } = req.body;

    const [result] = await connection.execute(
      `UPDATE events 
      SET date = ?, time = ?, responsibleEmployee = ?, court = ?, case_num = ? 
      WHERE id = ?`,
      [date, time, responsibleEmployee, court, case_num, id]
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

module.exports = {
  addEvent,
  getEvents,
  getEventsByDate,
  getSingleEvent,
  editEvent,
};
