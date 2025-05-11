import React, { useState, useEffect } from "react";
import { getTodayDate } from "../utils/dates";
import { useLocation, useNavigate } from "react-router";
import { Calendar } from "react-big-calendar";
import { demoEvents } from "../utils/db";
import { localizer, messages, calendarFormats } from "../utils/calendarConfig";
import { Link } from "react-router-dom";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import Legend from "./Legend";

export default function MainPage() {
  const DnDCalendar = withDragAndDrop(Calendar);
  const location = useLocation();
  console.log(location.pathname);

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

  return (
    <div className="flex flex-row flex-1">
      <main className="flex-1 bg-[#F0F2F5] p-4 overflow-auto mt-[11vh] gap-5 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-end mb-2">
            <Link
              to="/add"
              className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-l shadow-md transition"
              title="Добавить событие"
            >
              +
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-4 text-center">
            Монополия
          </h2>
          <DnDCalendar
            min={new Date(0, 0, 0, 0, 0)}
            max={new Date(0, 0, 0, 23, 59)}
            formats={calendarFormats}
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
        <Legend />
      </main>
    </div>
  );
}
