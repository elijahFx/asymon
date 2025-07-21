import { useState, useEffect } from "react";
import { getTodayDate, isOverlapping } from "../utils/dates";
import { useNavigate } from "react-router";
import { Calendar } from "react-big-calendar";
import { Calendar as UsualCalendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  localizer,
  messages,
  calendarFormats,
  spaceBackgroundColors,
  weekendBackgroundColors,
} from "../utils/calendarConfig";
import { Link } from "react-router-dom";
import {
  useGetMonopolyEventsQuery,
  useUpdateMonopolyEventMutation,
} from "../apis/monopolyEventsApi";
import {
  useGetJungleEventsQuery,
  useUpdateJungleEventMutation,
} from "../apis/jungleEventsApi";
import {
  useGetBunkerEventsQuery,
  useUpdateBunkerEventMutation,
} from "../apis/bunkerEventsApi";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import Legend from "./Legend";
import CalendarEventComponent from "./CalendarEventComponent";
import {
  CalendarSync,
  ShieldUser,
  Citrus,
  Calendar as CalendarLucide,
  Eye,
  Hourglass
} from "lucide-react";
import EventTable from "./EventTable";

export default function MainPage({ type = "monopoly" }) {
  const DnDCalendar = withDragAndDrop(Calendar);
  const navigate = useNavigate();
  const [today, setToday] = useState(getTodayDate());
  const [allEvents, setAllEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [namesake, setNamesake] = useState("");
  const [showBigCalendar, setShowBigCalendar] = useState(true);

  // Цвета для разных типов событий
  const eventTypeColors = {
    monopoly: "#EF4444", // red
    jungle: "#10B981", // green
    bunker: "#F59E0B", // yellow
  };

  // Определяем мутации для обновления событий
  const [updateMonopolyEvent] = useUpdateMonopolyEventMutation();
  const [updateJungleEvent] = useUpdateJungleEventMutation();
  const [updateBunkerEvent] = useUpdateBunkerEventMutation();

  // Получаем нужную мутацию в зависимости от типа
  const updateEventMutation = {
    monopoly: updateMonopolyEvent,
    jungle: updateJungleEvent,
    bunker: updateBunkerEvent,
  }[type];

  // Используем все хуки запросов
  const {
    data: monopolyData,
    isLoading: monopolyLoading,
    error: monopolyError,
  } = useGetMonopolyEventsQuery();

  const {
    data: jungleData,
    isLoading: jungleLoading,
    error: jungleError,
  } = useGetJungleEventsQuery();

  const {
    data: bunkerData,
    isLoading: bunkerLoading,
    error: bunkerError,
  } = useGetBunkerEventsQuery();

  // Определяем текущие данные в зависимости от типа
  const currentData = {
    monopoly: monopolyData,
    jungle: jungleData,
    bunker: bunkerData,
  }[type];

  const isLoading = {
    monopoly: monopolyLoading,
    jungle: jungleLoading,
    bunker: bunkerLoading,
  }[type];

  const error = {
    monopoly: monopolyError,
    jungle: jungleError,
    bunker: bunkerError,
  }[type];

  const menuItems = [
    {
      label: "Монополия",
      icon: <CalendarLucide color="red" />,
      link: "/main",
      type: "monopoly",
    },
    {
      label: "Джуманджи",
      icon: <Citrus color="green" />,
      link: "/jungle",
      type: "jungle",
    },
    {
      label: "Бункер",
      icon: <ShieldUser color="gold" />,
      link: "/bunker",
      type: "bunker",
    },
  ];

  const otherMenuItems = menuItems.filter((item) => item.type !== type);

  // Функция для стилизации дней в календаре
  const dayPropGetter = (date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 - воскресенье, 6 - суббота

    return {
      style: {
        backgroundColor: isWeekend
          ? weekendBackgroundColors[type]
          : spaceBackgroundColors[type],
      },
    };
  };

  // Устанавливаем название в зависимости от типа
  useEffect(() => {
    const namesakes = {
      monopoly: "Монополия",
      jungle: "Джуманджи",
      bunker: "Бункер",
    };
    setNamesake(namesakes[type] || "Монополия");
  }, [type]);

  // Преобразование данных из API в формат для календаря
  useEffect(() => {
    if (currentData) {
      console.log(currentData);

      const formattedEvents = currentData.map((event) => ({
        id: event.id,
        title: `${event.consumerName}`,
        start: new Date(`${event.date}T${event.start}`),
        end: new Date(`${event.date}T${event.end}`),
        status: event.status,
        allDay: false,
        resource: {
          phone: event.phoneNumber,
          messenger: event.messenger,
          nickname: event.messengerNickname,
          people: event.peopleAmount,
          children: event.childrenAmount,
          wishes: event.wishes,
          place: type,
        },
        isAmateur: event.isAmeteur,
      }));
      setAllEvents(formattedEvents);
    }
  }, [currentData, type]);

  const onChangeDate = (newDate) => {
    setDate(newDate);
    const day = String(newDate.getDate()).padStart(2, "0");
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const year = newDate.getFullYear();
    setToday(`${day}.${month}.${year}`);
  };

  const formatTime = (date) => date.toTimeString().slice(0, 5);

  const formatDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const updateEvent = async (id, start, end) => {
    try {
      const updatedEvent = {
        id,
        date: formatDateString(start),
        start: formatTime(start),
        end: formatTime(end),
      };
      await updateEventMutation(updatedEvent).unwrap();
      return true;
    } catch (error) {
      console.error("Ошибка при обновлении события:", error);
      alert("Не удалось обновить событие на сервере");
      return false;
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    if (isOverlapping(start, end, event.id, allEvents)) {
      alert("Невозможно переместить событие: оно перекрывается с другим.");
      return;
    }

    if (await updateEvent(event.id, start, end)) {
      setAllEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
      );
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    if (isOverlapping(start, end, event.id, allEvents)) {
      alert("Невозможно изменить размер события: оно перекрывается с другим.");
      return;
    }

    if (await updateEvent(event.id, start, end)) {
      setAllEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
      );
    }
  };

  const getEventColor = (status) => {
    const colors = {
      Новое: "#3b82f6",
      "В работе": "#f59e0b",
      "Запись подтверждена": "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  // Функция для получения событий на конкретную дату
  const getEventsForDate = (date) => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Обработчик клика по дате в UsualCalendar
  const handleDateClick = (value) => {
    const events = getEventsForDate(value);
    console.log("События на выбранную дату:", events);
    onChangeDate(value);
  };

  // Функция для подсветки дней с событиями
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const events = getEventsForDate(date);
    if (events.length > 0) {
      return "day-with-events";
    }
    return null;
  };

  // Функция для отображения маркеров событий в днях
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    // Собираем уникальные типы событий для этого дня
    const eventTypes = new Set();
    events.forEach((event) => eventTypes.add(event.resource.place));

    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {eventTypes.has("monopoly") && (
          <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
        )}
        {eventTypes.has("jungle") && (
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
        )}
        {eventTypes.has("bunker") && (
          <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        )}
      </div>
    );
  };

  const toggleCalendarView = () => setShowBigCalendar((prev) => !prev);

  return (
    <div className="flex flex-row flex-1 sm:overflow-scroll max-w-full md:max-w-none">
      <main className="flex-1 bg-[#F0F2F5] p-4 overflow-auto mt-[11vh] gap-5 flex flex-col w-full md:w-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-[90vw] md:max-w-none mx-auto">
          <div className="flex justify-end mb-2 items-center">
            <h2 className="text-l font-bold text-center mr-auto">{namesake}</h2>

            {otherMenuItems.map((item, index) => (
              <Link
                to={item.link}
                key={index}
                className="mr-2 text-gray-700 hover:text-gray-900"
                title={item.label}
              >
                {item.icon}
              </Link>
            ))}

            <Link
              to={`/add?type=${type}`}
              className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-l shadow-md transition mr-2"
              title="Добавить событие"
            >
              +
            </Link>
            <Link to="/views/add">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition shadow cursor-pointer">
                <Eye size={18} /> Просмотр
              </button>
            </Link>

            <Link to="/waitings/add">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition shadow cursor-pointer ml-1.5 mr-1.5">
                <Hourglass size={18} /> Лист ожидания
              </button>
            </Link>
            <CalendarSync
              onClick={toggleCalendarView}
              className="cursor-pointer"
              color="#191A4B"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-10">Загрузка событий...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Ошибка загрузки событий
            </div>
          ) : showBigCalendar ? (
            <div className="overflow-x-auto">
              <div className="min-w-[300px]">
                <DnDCalendar
                  min={new Date(0, 0, 0, 0, 0)}
                  max={new Date(0, 0, 0, 23, 59)}
                  formats={calendarFormats}
                  localizer={localizer}
                  events={allEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 550, minWidth: 300 }}
                  culture="ru"
                  messages={messages}
                  date={date}
                  view={view}
                  onView={setView}
                  onNavigate={onChangeDate}
                  defaultView="month"
                  resizable
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  draggableAccessor={() => true}
                  components={{ event: CalendarEventComponent }}
                  dayPropGetter={dayPropGetter} // Добавляем кастомные стили для дней
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="basis-1/2">
                <UsualCalendar
                  onChange={handleDateClick}
                  onClickDay={handleDateClick}
                  value={date}
                  locale="ru-RU"
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                  className="w-full border-0"
                />
              </div>
              <EventTable
                todaysDate={today}
                allEvents={allEvents}
                loading={isLoading}
                error={error}
              />
            </div>
          )}
        </div>
        <Legend type={type} />
      </main>
    </div>
  );
}

const styles = `
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
`;

// Вставляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
