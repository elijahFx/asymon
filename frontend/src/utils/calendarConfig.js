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
