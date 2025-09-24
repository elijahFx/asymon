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
  Hourglass,
} from "lucide-react";
import EventTable from "./EventTable";
import SmallWaitingList from "./WaitingList/SmallWaitingList";
import { extractWaitings, styles } from "../utils/calendarConfig";
import { formatDate, isDateInPeriod } from "../utils/dates";
import {
  useGetAllViewsQuery,
  useGetViewsFromBunkerQuery,
  useGetViewsFromMonopolyQuery,
  useGetViewsFromJungleQuery,
} from "../apis/viewsApi";

const menuSize = 37;

export default function MainPage({ type = "monopoly" }) {
  const DnDCalendar = withDragAndDrop(Calendar);
  const [today, setToday] = useState(getTodayDate());
  const [allEvents, setAllEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [namesake, setNamesake] = useState("");
  const [showBigCalendar, setShowBigCalendar] = useState(true);
  const [waitings, setWaitings] = useState([]);
  const [views, setViews] = useState([]);
  const [filteredViewsData, setFilteredViewsData] = useState([]);

  // Определяем мутации для обновления событий
  const [updateMonopolyEvent] = useUpdateMonopolyEventMutation();
  const [updateJungleEvent] = useUpdateJungleEventMutation();
  const [updateBunkerEvent] = useUpdateBunkerEventMutation();

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

  const {
    data: viewsData,
    isLoading: viewsLoading,
    error: viewsError,
  } = {
    monopoly: useGetViewsFromMonopolyQuery(),
    jungle: useGetViewsFromJungleQuery(),
    bunker: useGetViewsFromBunkerQuery(),
  }[type];

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
      icon: <CalendarLucide color="red" size={menuSize} />,
      link: "/main",
      type: "monopoly",
    },
    {
      label: "Джуманджи",
      icon: <Citrus color="green" size={menuSize} />,
      link: "/jungle",
      type: "jungle",
    },
    {
      label: "Бункер",
      icon: <ShieldUser color="gold" size={menuSize} />,
      link: "/bunker",
      type: "bunker",
    },
  ];

  const otherMenuItems = menuItems.filter((item) => item.type !== type);

  const dayPropGetter = (date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
      style: {
        backgroundColor: isWeekend
          ? weekendBackgroundColors[type]
          : spaceBackgroundColors[type],
      },
    };
  };

  useEffect(() => {
    const namesakes = {
      monopoly: "Монополия",
      jungle: "Джуманджи",
      bunker: "Бункер",
    };
    setNamesake(namesakes[type] || "Монополия");
  }, [type]);

  useEffect(() => {
    if (viewsData) {
      setViews(viewsData);
      console.log("Просмотры для", type, ":", viewsData);
    }
  }, [viewsData, type]);

 useEffect(() => {
  if (currentData) {
    const extractedWaitings = extractWaitings(currentData);
    console.log('Extracted waitings:', extractedWaitings);

    // Функция для проверки, входит ли дата в период
    const isDateInPeriod = (waitingDate, currentDate, currentView) => {
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

    // Фильтруем waitings, которые входят в текущий период
    const filteredWaitings = extractedWaitings.filter(waiting => 
      isDateInPeriod(waiting.date, date, view)
    );

    // Фильтруем viewsData, которые входят в текущий период
    const preFilteredViewsData = viewsData?.filter(viewItem => 
      isDateInPeriod(viewItem.date, date, view)
    );

    setFilteredViewsData(preFilteredViewsData)

    console.log('Filtered waitings for current period:', filteredWaitings);
    console.log('Filtered viewsData for current period:', preFilteredViewsData);

    // Получаем информацию о текущем периоде календаря
    let periodInfo = "";
    if (view === "month") {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      periodInfo = `Период: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
    } else if (view === "week") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(
        date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      periodInfo = `Период: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    } else if (view === "day") {
      periodInfo = `День: ${formatDate(date)}`;
    }
    
    console.log("Текущий период календаря:", periodInfo);
    console.log(`Найдено waitings в периоде: ${filteredWaitings.length} из ${extractedWaitings.length}`);
    console.log(`Найдено viewsData в периоде: ${preFilteredViewsData.length} из ${viewsData.length}`);

    setWaitings(filteredWaitings);
    // Если у вас есть setter для viewsData, установите отфильтрованные данные
    // setViewsData(filteredViewsData);
  }
}, [currentData, view, date, viewsData]); // Добавляем viewsData в зависимости

  useEffect(() => {
    if (currentData) {
      const formattedEvents = currentData.map((event) => ({
        id: event.id,
        title: `${formatTime(
          new Date(`${event.date}T${event.start}`)
        )} - ${formatTime(new Date(`${event.date}T${event.end}`))}`,
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
          place: event.location ? "view" : type,
          name: event.consumerName || "",
          tariff: event.peopleTariff,
        },
        isAmateur: event.isAmeteur,
        view: view,
      }));
      setAllEvents(formattedEvents);
    }
  }, [currentData, type, view]);

  const onChangeDate = (newDate) => {
    setDate(newDate);
    const day = String(newDate.getDate()).padStart(2, "0");
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const year = newDate.getFullYear();
    setToday(`${day}.${month}.${year}`);
  };

  const formatTime = (date) => {
    if (!date) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

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

  const handleDateClick = (value) => {
    const events = getEventsForDate(value);
    console.log("События на выбранную дату:", events);
    onChangeDate(value);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const events = getEventsForDate(date);
    if (events.length > 0) {
      return "day-with-events";
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const events = getEventsForDate(date);
    if (events.length === 0) return null;

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

  // Новая функция для рендеринга временных интервалов в ячейке дня
  const renderTimeSlots = (date) => {
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    return (
      <div className="p-1 space-y-1">
        {events.slice(0, 2).map((event) => (
          <CalendarEventComponent
            key={event.id}
            event={event}
            continuesEarlier={false}
            continuesLater={false}
          />
        ))}
        {events.length > 2 && (
          <div className="text-xs text-gray-500 text-center">
            +{events.length - 2} ещё
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-row flex-1 sm:overflow-scroll max-w-full md:max-w-none">
      <main className="flex-1 bg-[#F0F2F5] p-4 overflow-auto mt-[11vh] gap-5 flex flex-col w-full md:w-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-[90vw] md:max-w-none mx-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-2 p-2 gap-4 min-h-[50px]">
            {/* Левая часть - заголовок */}
            <h2 className="text-l font-bold text-center truncate">
              {namesake}
            </h2>

            {/* Центр - меню */}
            <div className="flex justify-center items-center space-x-2 mx-auto">
              {otherMenuItems.map((item, index) => (
                <Link
                  to={item.link}
                  key={index}
                  className="text-gray-700 hover:text-gray-900 p-1 flex-shrink-0"
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}
            </div>

            {/* Правая часть - кнопки */}
            <div className="flex items-center justify-end gap-2 flex-shrink-0">
              <Link
                to={`/add?type=${type}`}
                className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-l shadow-md transition flex-shrink-0"
                title="Добавить событие"
              >
                +
              </Link>

              <Link to="/views/add">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition shadow cursor-pointer flex-shrink-0">
                  <Eye size={18} /> Просмотр
                </button>
              </Link>

              <Link to="/waitings/add">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition shadow cursor-pointer flex-shrink-0">
                  <Hourglass size={18} /> Лист ожидания
                </button>
              </Link>

              <CalendarSync
                onClick={toggleCalendarView}
                className="cursor-pointer flex-shrink-0"
                color="#191A4B"
              />
            </div>
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
                views={['month', 'week', 'day']}
                  min={new Date(0, 0, 0, 0, 0)}
                  max={new Date(0, 0, 0, 23, 59)}
                  formats={{
                    ...calendarFormats,
                    eventTimeRangeFormat: (
                      { start, end },
                      culture,
                      localizer
                    ) =>
                      `${localizer.format(
                        start,
                        "HH:mm",
                        culture
                      )} - ${localizer.format(end, "HH:mm", culture)}`,
                    agendaTimeFormat: (date, culture, localizer) =>
                      localizer.format(date, "HH:mm", culture),
                    agendaTimeRangeFormat: (
                      { start, end },
                      culture,
                      localizer
                    ) =>
                      `${localizer.format(
                        start,
                        "HH:mm",
                        culture
                      )} - ${localizer.format(end, "HH:mm", culture)}`,
                  }}
                  localizer={localizer}
                  events={allEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 850, minWidth: 300 }}
                  culture="ru"
                  messages={messages}
                  date={date}
                  view={view}
                  onView={(view2) => {
                    setView(view2);
                  }}
                  onNavigate={onChangeDate}
                  defaultView="month"
                  resizable
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  draggableAccessor={() => true}
                  components={{
                    event: CalendarEventComponent,
                    month: {
                      dateHeader: ({ date, label }) => (
                        <div className="rbc-date-cell relative h-full">
                          {/* Контейнер для событий */}
                          <div className="h-full overflow-hidden">
                            {renderTimeSlots(date)}
                          </div>
                          {/* Число дня - абсолютно позиционировано в правом нижнем углу */}
                          <div className="absolute bottom-1 right-1 mt-27">
                            {date.getDate()}
                          </div>
                        </div>
                      ),
                    },
                  }}
                  dayPropGetter={dayPropGetter}
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
        {/* Просомотры */}
        <SmallWaitingList waitings={waitings} place="waitings"/>
        {/* Лист ожидания */}
        <SmallWaitingList waitings={filteredViewsData}  />
        <Legend type={type} />
      </main>
    </div>
  );
}

// Вставляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
