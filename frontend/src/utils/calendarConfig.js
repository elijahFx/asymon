import moment from "moment";
import { momentLocalizer } from "react-big-calendar";

// Настройка локали с указанием, что неделя начинается с понедельника
moment.locale("ru", {
  months:
    "Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь".split(
      "_"
    ),
  monthsShort: "янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек".split("_"),
  weekdays:
    "воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),
  weekdaysShort: "вс_пн_вт_ср_чт_пт_сб".split("_"),
  weekdaysMin: "вс_пн_вт_ср_чт_пт_сб".split("_"),
  week: {
    dow: 1, // Понедельник - первый день недели (0 - воскресенье, 1 - понедельник)
    doy: 4, // Первая неделя года должна содержать 4 января
  },
});

export const localizer = momentLocalizer(moment);

export const messages = {
  today: "Сегодня",
  previous: "Назад",
  next: "Вперед",
  month: "Месяц",
  week: "Неделя",
  day: "День",
  agenda: "Повестка",
  date: "Дата",
  time: "Время",
  event: "Событие",
  noEventsInRange: "Нет событий в этом диапазоне.",
  showMore: (total) => `+ Ещё ${total}`,
};

const timeGutterFormat = (date, culture, localizer) =>
  date.getHours().toString().padStart(2, "0") + ":00";

export const calendarFormats = {
  timeGutterFormat,
};

// Более яркие цвета для выходных
export const spaceBackgroundColors = {
  monopoly: "rgba(239, 68, 68, 0.1)", // розовый с прозрачностью
  jungle: "rgba(16, 185, 129, 0.1)", // зеленый с прозрачностью
  bunker: "rgba(245, 158, 11, 0.1)", // желтый с прозрачностью
};

// Более яркие цвета для выходных (суббота и воскресенье)
export const weekendBackgroundColors = {
  monopoly: "rgba(239, 68, 68, 0.2)", // более яркий розовый
  jungle: "rgba(16, 185, 129, 0.2)", // более яркий зеленый
  bunker: "rgba(245, 158, 11, 0.2)", // более яркий желтый
};

export const extractWaitings = (events) => {

  console.log(events);
  

  if (!events || !Array.isArray(events)) return [];
  
  return events.filter(event => {
    // Если у объекта нет start и end, то это waiting
    return !event.start && !event.end;
  });
};

export const styles = `
  /* Общие стили для дней с событиями */
  .day-with-events {
    background-color: #191A4B !important;
    color: white !important;
    position: relative;
  }
  .day-with-events:hover {
    background-color: #2A2B7C !important;
  }
  .day-with-events abbr {
    position: relative;
    z-index: 1;
  }
  .react-calendar__tile {
    position: relative;
    overflow: visible;
  }

  /* Стили для react-big-calendar */
  .rbc-month-view {
    background-color: transparent;
  }
  .rbc-month-row {
    background-color: transparent;
  }
  .rbc-day-bg + .rbc-day-bg {
    background-color: transparent;
  }
  .rbc-off-range-bg {
    background-color: transparent;
  }
  .rbc-date-cell {
    position: relative;
    height: 100%;
  }
  .rbc-date-cell > div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 2px;
  }
  .rbc-date-cell .time-slot {
    font-size: 10px;
    margin: 1px 0;
    padding: 1px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
  }
  .rbc-event,
  .rbc-background-event {
    padding: 0px !important;
    border: none !important;
  }
  .rbc-event-label {
    display: none !important;
  }

  /* УВЕЛИЧИВАЕМ ЯЧЕЙКИ В НЕДЕЛЬНОМ ВИДЕ */
  .rbc-time-view {
    min-height: 800px; /* Общая высота недельного вида */
  }
  .rbc-time-header {
    min-height: 80px; /* Высота заголовка */
  }
  .rbc-time-header-cell {
    height: 80px !important;
  }
  .rbc-time-content {
    min-height: 720px; /* Высота контентной части */
  }
  .rbc-time-column {
    min-width: 60px; /* Ширина колонки времени */
  }

  .rbc-time-slot {
    height: 60px !important; /* Высота каждого временного слота */
    min-height: 60px;
  }
  .rbc-timeslot-group {
    min-height: 60px;
  }
  .rbc-allday-cell {
    height: 50px !important; /* Высота ячейки "Весь день" */
  }

  /* Увеличиваем события в недельном виде */
  .rbc-time-view .rbc-event {
    font-size: 12px;
  }
`;
