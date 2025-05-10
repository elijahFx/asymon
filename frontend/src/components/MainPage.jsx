import React, { useState, useEffect } from "react";
import { getTodayDate } from "../utils/dates";
import { useNavigate } from "react-router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { demoEvents } from "../utils/db";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";

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
});

const localizer = momentLocalizer(moment);

export default function MainPage() {
  const DnDCalendar = withDragAndDrop(Calendar);

  const navigate = useNavigate();
  const [today, setToday] = useState(getTodayDate());
  const [allEvents, setAllEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

 /* const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useGetEventsQuery(); */

  useEffect(() => {
    navigate("/main");
    setAllEvents(demoEvents);

    // If using API data instead of demo:
    // if (eventsData) {
    //   const formattedEvents = eventsData.map(event => ({
    //     ...event,
    //     title: event.title || 'Событие',
    //     start: new Date(event.start || event.date),
    //     end: new Date(event.end || event.date)
    //   }));
    //   setAllEvents(formattedEvents);
    // }
  }, [navigate]);

  const onChangeDate = (newDate) => {
    setDate(newDate);
    const day = String(newDate.getDate()).padStart(2, "0");
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const year = newDate.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    setToday(formattedDate);
  };

  const handleEventDrop = ({ event, start, end, allDay }) => {
    if (isOverlapping(start, end, event.id)) {
      alert("Невозможно переместить событие: оно перекрывается с другим.");
      return;
    }
    const updatedEvents = allEvents.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end, allDay }
        : existingEvent
    );
    setAllEvents(updatedEvents);
  };

  const handleEventResize = ({ event, start, end }) => {
    if (isOverlapping(start, end, event.id)) {
      alert("Невозможно изменить размер события: оно перекрывается с другим.");
      return;
    }
    const updatedEvents = allEvents.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    );
    setAllEvents(updatedEvents);
  };

  const isOverlapping = (start, end, eventId = null) => {
    return allEvents.some((event) => {
      if (event.id === eventId) return false; // Игнорировать текущее событие при редактировании
      return start < event.end && end > event.start;
    });
  };

  const messages = {
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

  return (
    <div className="flex flex-row flex-1">
      <main className="flex-1 bg-[#F0F2F5] p-4 overflow-auto mt-[11vh] gap-5 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <DnDCalendar
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
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
            components={{
              event: ({ event }) => (
                <div className="p-1">
                  <strong>{event.title}</strong>
                  {event.description && <div>{event.description}</div>}
                </div>
              ),
            }}
          />
        </div>
      </main>
    </div>
  );
}
