// EventTable.js
import React from "react";
import SingleUsualEvent from "./SingleUsualEvent";
import { formatDateToRussian, parseDateString } from "../utils/dates"; // Добавьте эту функцию в ваш dates.js

export default function EventTable({ todaysDate, allEvents, loading, error }) {
  if (loading) return <div className="text-center py-4">Загрузка событий...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Ошибка загрузки событий</div>;

  // Парсим дату в правильном формате
  const selectedDate = parseDateString(todaysDate);
  
  const eventsForToday = allEvents.filter(event => {
    const eventDate = new Date(event.start);


    
    
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  
    console.log(eventsForToday);

  const noEvents = <div className="text-center py-4 text-gray-500">На этот день нет событий</div>;

  return (
    <div className="relative basis-1/2 flex-none">
      <div className="bg-white p-4 rounded-lg h-full">
        <div className="flex items-center pb-3 mb-3 border-b border-gray-200">
          <h2 className="font-bold flex-grow">
            События на {formatDateToRussian(todaysDate)}
          </h2>
        </div>
        <div className="events-content">
          {eventsForToday.length > 0 ? (
            eventsForToday.map((event) => (
              <SingleUsualEvent
                key={event.id}
                id={event.id}
                time={`${formatTime(event.start)}-${formatTime(event.end)}`}
                eventType={event.resource.place}
                clientName={event.resource.name}
                phoneNumber={event.title.match(/\(([^)]+)\)/)?.[1] || ""}
                admin={event.resource.nickname || "Не указан"}
                adultsCount={event.resource.people}
                childrenCount={event.resource.children}
                notes={event.resource.wishes}
                place={event.resource.place}
                status={event.status}
              />
            ))
          ) : (
            noEvents
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toTimeString().slice(0, 5);
}