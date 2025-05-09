const createDbConnection = require("../db");

async function getUsersStatistics(req, res) {
  let connection;

  try {
    connection = await createDbConnection();

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Не передан ID пользователя" });
    }

    // Находим пользователя по id
    const [users] = await connection.query(
      "SELECT id, fullName FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = users[0];

    // Получаем общее количество дел
    const [caseCountResult] = await connection.query(
      "SELECT COUNT(*) AS count FROM cases WHERE responsibleEmployee = ?",
      [user.fullName]
    );
    const caseCount = caseCountResult[0]?.count || 0;

    // Получаем количество дел по активным статусам
    const [statusCounts] = await connection.query(
      `SELECT status, COUNT(*) as count
       FROM cases
       WHERE responsibleEmployee = ?
         AND status IN (?, ?, ?, ?)
       GROUP BY status`,
      [
        user.fullName,
        "Новое",
        "Ведется работа по делу",
        "В архиве",
        "Вынесено решение (определение)",
      ]
    );

    const statusCountMap = {
      "Новое": 0,
      "Ведется работа по делу": 0,
      "В архиве": 0,
      "Вынесено решение (определение)": 0,
    };

    statusCounts.forEach(({ status, count }) => {
      statusCountMap[status] = count;
    });

    // Получаем court_decisions по user_id
    const [decisions] = await connection.query(
      "SELECT society_expenses, society_penalty, consumer_money FROM court_decisions WHERE user_id = ?",
      [user.id]
    );

    let totalSocietyExpenses = 0;
    let totalSocietyPenalty = 0;
    let totalConsumerMoney = 0;

    decisions.forEach((decision) => {
      totalSocietyExpenses += Number(decision.society_expenses || 0);
      totalSocietyPenalty += Number(decision.society_penalty || 0);
      totalConsumerMoney += Number(decision.consumer_money || 0);
    });

    return res.status(200).json({
      userId: user.id,
      fullName: user.fullName,
      totalCases: caseCount,
      activeCaseStatuses: statusCountMap,
      courtDecisions: {
        totalSocietyExpenses,
        totalSocietyPenalty,
        totalSocietyLoss: totalSocietyExpenses + totalSocietyPenalty,
        totalConsumerMoney,
      },
    });
  } catch (error) {
    console.error("getUsersStatistics error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { getUsersStatistics };
