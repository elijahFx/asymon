import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { STATUS_COLORS } from "../../utils/types";

const SingleRow = ({ event, calculateTotalCost, formatDate, type }) => {
  const [whatType, setWhatType] = useState("");

  useEffect(() => {
    setWhatType(type);
  }, [type, event]);

  // Determine the correct route based on event type
  const getEventRoute = () => {
    switch (whatType) {
      case "monopoly":
        return `/event/${event.id}`;
      case "jungle":
        return `/jungle/event/${event.id}`;
      case "bunker":
        return `/bunker/event/${event.id}`;
      default:
        return `/event/${event.id}`;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {event.place || "—"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {event.start && event.end ? `${event.start} - ${event.end}` : "—"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {calculateTotalCost(event)} Br
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            STATUS_COLORS[event.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {event.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {formatDate(event.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        [
        <Link
          to={getEventRoute()}
          className="text-blue-600 hover:text-blue-900"
        >
          Просмотр
        </Link>
        ]
      </td>
    </tr>
  );
};

export default SingleRow;