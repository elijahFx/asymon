// Вспомогательная функция для получения таблицы событий по локации
function getEventTableByLocation(location) {
  switch (location) {
    case "Монополия":
      return "monopoly_events";
    case "Джуманджи":
      return "jungle_events";
    case "Бункер":
      return "bunker_events";
    default:
      return null;
  }
}

const adjustTime = (time, minutes) => {
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
};

const checkScheduleConflicts = async (
  connection,
  eventTable,
  date,
  start,
  end,
  location,
  excludeId = null
) => {
  if (!eventTable) return [];

  const startTime = new Date(`${date}T${start}`);
  const endTime = new Date(`${date}T${end}`);

  // Рассчитываем 29-минутные буферы
  const bufferStart = new Date(startTime.getTime() - 29 * 60000)
    .toTimeString()
    .substr(0, 8);
  const bufferEnd = new Date(endTime.getTime() + 29 * 60000)
    .toTimeString()
    .substr(0, 8);

  // Базовые условия для проверки пересечений
  const baseConditions = `
    (start < ? AND end > ?) OR      -- Существующее событие охватывает новое
    (start >= ? AND start < ?) OR   -- Существующее начинается во время нового
    (end > ? AND end <= ?) OR       -- Существующее заканчивается во время нового
    (start <= ? AND end >= ?)       -- Новое событие охватывает существующее
  `;

  // Условия для проверки 29-минутного буфера
  const bufferConditions = `
    (start BETWEEN ? AND ?) OR      -- Начало существующего в буфере
    (end BETWEEN ? AND ?) OR        -- Конец существующего в буфере
    (start <= ? AND end >= ?)       -- Существующее охватывает буфер
  `;

  const queryParams = [
    // Параметры для baseConditions (8 параметров)
    end,
    start, // для первого условия
    start,
    end, // для второго условия
    start,
    end, // для третьего условия
    start,
    end, // для четвертого условия

    // Параметры для bufferConditions (6 параметров)
    bufferStart,
    bufferEnd, // для первого buffer условия
    bufferStart,
    bufferEnd, // для второго buffer условия
    bufferStart,
    bufferEnd, // для третьего buffer условия
  ];

  let query = `
    SELECT * FROM ${eventTable} 
    WHERE date = ? 
    AND (
      ${baseConditions} OR 
      ${bufferConditions}
    )
  `;

  // Добавляем параметр date в начало массива параметров
  queryParams.unshift(date);

  // Если нужно исключить определенный ID (для update)
  if (excludeId) {
    query += " AND id != ?";
    queryParams.push(excludeId);
  }

  const [conflicts] = await connection.execute(query, queryParams);
  return conflicts;
};

module.exports = {
  getEventTableByLocation,
  adjustTime,
  checkScheduleConflicts,
};
