import React from "react";
import { Link } from "react-router-dom";

export default function SingleUsualEvent({
  id,
  time,
  eventType,
  clientName,
  phoneNumber,
  admin,
  adultsCount,
  childrenCount,
  notes,
  status = "Просмотр"
}) {
  // Цвета для разных типов событий
  const typeColors = {
    monopoly: "#EF4444", // red
    jungle: "#10B981", // green
    bunker: "#F59E0B", // yellow
  };

  console.log(eventType);

  // Формируем путь в зависимости от типа события
  const getEventPath = () => {
    switch (eventType.toLowerCase()) {
      case "монополия":
      case "monopoly":
        return `/event/${id}`;
      case "джуманджи":
      case "jungle":
        return `/jungle/event/${id}`;
      case "view":
        return `/views/${id}`;
      case "бункер":
      case "bunker":
        return `/bunker/event/${id}`;
      default:
        return `/event/${id}`;
    }
  };

  const borderColor = typeColors[eventType.toLowerCase()] || "#6B7280";

  return (
    <div
      className="flex flex-col p-3 mb-3 rounded-lg bg-white shadow hover:shadow-md transition-all"
      style={{ borderLeft: `5px solid ${borderColor}` }}
    >
      <div className="flex justify-between items-start">
        <div className="font-bold text-lg">{time}</div>
        <span
          className="px-2 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: borderColor }}
        >
          {eventType}
        </span>
      </div>

      <div className="mt-2">
        <div className="font-medium">{clientName}</div>
        <div className="text-sm text-gray-600">{phoneNumber}</div>
      </div>

      <div className="mt-2">
        <div className="text-sm">
          <span className="font-medium">Статус:</span> {status}
        </div>
        <div className="text-sm">
          <span className="font-medium">Участники:</span> {adultsCount}{" "}
          взрослых, {childrenCount} детей
        </div>
      </div>

      {notes && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Примечания:</span> {notes}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-100">
        <Link
          to={getEventPath()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Просмотр
        </Link>
      </div>
    </div>
  );
}
