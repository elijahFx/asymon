import React from "react";
import { Link } from "react-router-dom";
import { Phone, User, Calendar, Clock } from "lucide-react";

const WaitingRow = ({ item, formatDate, type, place, time }) => {
  // Определяем маршрут для редактирования
  const getEditRoute = () => {
    return `/${type}/${item.id}`;
  };

  console.log(item);
  

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="mr-2 text-gray-400" size={16} />
          <div className="text-sm text-gray-900">
            {formatDate(item.date)}
          </div>
        </div>
      </td>
      
      {type === "views" && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Clock className="mr-2 text-gray-400" size={16} />
            <div className="text-sm text-gray-900">
              {time || "—"}
            </div>
          </div>
        </td>
      )}
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="mr-2 text-gray-400" size={16} />
          <div className="text-sm text-gray-900">
            {item.name || "—"}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Phone className="mr-2 text-gray-400" size={16} />
          <div className="text-sm text-gray-900">
            {item.phone || "—"}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {formatDate(item.createdAt)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        [
        <Link
          to={getEditRoute()}
          className="text-blue-600 hover:text-blue-900"
        >
          Просмотр
        </Link>
        ]
      </td>
    </tr>
  );
};

export default WaitingRow;