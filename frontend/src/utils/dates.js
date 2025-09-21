export function formatDateToRussian(dateString) {
  const [day, month, year] = dateString.split(".");

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const monthName = months[parseInt(month, 10) - 1];

  return `${parseInt(day, 10)} ${monthName} ${year} года`;
}

export function getTodayDateFormatted() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Месяцы от 0 до 11
  const year = today.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDate(isoString) {
  const date = new Date(isoString);

  // Получаем компоненты даты
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы 0-11
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDateFromLinesToDots(inputDate) {
  // Разбиваем строку на части по разделителю '-'
  const parts = inputDate?.split("-");

  // Проверяем, что дата имеет правильный формат
  if (parts?.length !== 3) {
    return inputDate;
  }

  const [year, month, day] = parts;

  // Собираем дату в новом формате
  return `${day}.${month}.${year}`;
}

export function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0"); // Добавляем ведущий ноль
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Месяцы 0-11
  const year = today.getFullYear();

  return `${day}.${month}.${year}`;
}

export function isOverlapping(start, end, eventId = null, allEvents) {
  return allEvents.some((event) => {
    if (event.id === eventId) return false;
    return start < event.end && end > event.start;
  });
}

// dates.js
export function parseDateString(dateStr) {
  // Если дата в формате "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }
  
  // Если дата в формате "DD.MM.YYYY"
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
  }
  
  // Если дата в формате "DD/MM/YYYY"
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  }
  
  // Если это уже Date объект
  if (dateStr instanceof Date) {
    return dateStr;
  }
  
  // По умолчанию пытаемся создать Date
  return new Date(dateStr);
}

export const isDateInPeriod = (waitingDate, currentDate, currentView) => {
      const dateToCheck = new Date(waitingDate);
      
      if (currentView === "day") {
        // Проверка на конкретный день
        return (
          dateToCheck.getDate() === currentDate.getDate() &&
          dateToCheck.getMonth() === currentDate.getMonth() &&
          dateToCheck.getFullYear() === currentDate.getFullYear()
        );
      } else if (currentView === "week") {
        // Проверка на неделю
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(
          currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)
        );
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return dateToCheck >= startOfWeek && dateToCheck <= endOfWeek;
      } else if (currentView === "month") {
        // Проверка на месяц
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        return dateToCheck >= startOfMonth && dateToCheck <= endOfMonth;
      }
      
      return false;
    };


