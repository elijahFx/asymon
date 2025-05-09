const { v4: uuidv4 } = require("uuid");
const createDbConnection = require("../db");

// Получить все жалобы
const getAllComplaints = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const [rows] = await connection.execute(
      `SELECT * FROM claims ORDER BY number DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Ошибка при получении жалоб:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Получить жалобу по ID
const getComplaintById = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    const [rows] = await connection.execute(
      `SELECT * FROM claims WHERE number = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Жалоба не найдена" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Ошибка при получении жалобы:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

// Создать новую жалобу
const createComplaint = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const {
      type,
      responsibleEmployee,
      consumerFullName,
      consumerPhone,
      consumerAddress,
      sellerName,
      sellerUnp,
      sellerAddress,
      goodName,
      cost,
      problem,
      contractDate,
      deadline,
      request,
      moral,
      penalty,
      status,
    } = req.body;

    // Обязательные поля
    if (!type) {
      return res.status(400).json({ error: "Тип жалобы обязателен" });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await connection.execute(
      `INSERT INTO claims (
        id, createdAt, type, responsibleEmployee, consumerFullName,
        consumerPhone, consumerAddress, sellerName, sellerUnp,
        sellerAddress, goodName, cost, problem, contractDate,
        deadline, request, moral, penalty, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createdAt,
        type,
        responsibleEmployee,
        consumerFullName,
        consumerPhone,
        consumerAddress,
        sellerName,
        sellerUnp,
        sellerAddress,
        goodName,
        cost,
        problem,
        contractDate,
        deadline,
        request,
        moral,
        penalty,
        status,
      ]
    );

    // Возвращаем созданную запись
    const [newComplaint] = await connection.execute(
      `SELECT * FROM claims WHERE id = ?`,
      [id]
    );

    res.status(201).json(newComplaint[0]);
  } catch (error) {
    console.error("Ошибка при создании жалобы:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

const deleteComplaint = async (req, res) => {
  let connection;
  try {
    connection = await createDbConnection();
    const { id } = req.params;

    // Проверяем существование жалобы
    const [existing] = await connection.execute(
      `SELECT * FROM claims WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Жалоба не найдена" });
    }

    await connection.execute(`DELETE FROM claims WHERE id = ?`, [id]);

    res.status(200).json({ message: "Жалоба успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении жалобы:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
};

const patchComplaintStatus = async (req, res) => {
    let connection;
    try {
      connection = await createDbConnection();
      const { id } = req.params;
      const { status, responsibleEmployee } = req.body;
  
      if (!status && !responsibleEmployee) {
        return res.status(400).json({ error: 'Нужно передать хотя бы одно поле: status или responsibleEmployee' });
      }
  
      // Проверка существования записи
      const [existing] = await connection.execute(`SELECT * FROM claims WHERE number = ?`, [id]);
  
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Жалоба не найдена' });
      }
  
      // Динамическое обновление полей
      const fields = [];
      const values = [];
  
      if (status) {
        fields.push('status = ?');
        values.push(status);
      }
      if (responsibleEmployee) {
        fields.push('responsibleEmployee = ?');
        values.push(responsibleEmployee);
      }
  
      values.push(id);
  
      await connection.execute(
        `UPDATE claims SET ${fields.join(', ')} WHERE number = ?`,
        values
      );
  
      const [updated] = await connection.execute(`SELECT * FROM claims WHERE number = ?`, [id]);
  
      res.status(200).json(updated[0]);
    } catch (error) {
      console.error('Ошибка при обновлении жалобы:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
      if (connection) await connection.end();
    }
  };

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  deleteComplaint,
  patchComplaintStatus,
};
