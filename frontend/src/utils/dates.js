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
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы 0-11
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}


export function formatDateFromLinesToDots(inputDate) {
  // Разбиваем строку на части по разделителю '-'
  const parts = inputDate.split('-');
  
  // Проверяем, что дата имеет правильный формат
  if (parts.length !== 3) {
    return inputDate
  }
  
  const [year, month, day] = parts;
  
  // Собираем дату в новом формате
  return `${day}.${month}.${year}`;
}

export function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Добавляем ведущий ноль
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Месяцы 0-11
  const year = today.getFullYear();
  
  return `${day}.${month}.${year}`;
}


