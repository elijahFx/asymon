import React from "react";
import { Link } from "react-router-dom";
import { useGetEventsQuery } from "../../apis/eventsApi";
import { formatDateFromLinesToDots } from "../../utils/dates";

export default function CalendarTable() {
  const { data: eventsList, isLoading, error } = useGetEventsQuery();

  const id = `1`;

  const [filters, setFilters] = React.useState({
    eventDate: "",
    eventType: "",
    caseNumber: "",
    responsible: "",
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredData = eventsList?.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return String(item[key])
        .toLowerCase()
        .includes(filters[key].toLowerCase());
    });
  });

  return (
    <div className="w-full max-w-full overflow-x-auto flex-1">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              <input type="checkbox" />
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              Дата события
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              Тип события
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              № дела
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              Ответственный работник
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[20%]">
              Действие
            </th>
          </tr>

          {/* Строка с полями поиска */}
          <tr className="bg-gray-100">
            <td className="px-2 py-2 border-b">
              <></>
            </td>
            <td className="px-2 py-2 border-b">
              <input
                type="text"
                placeholder="Поиск по дате"
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.eventDate}
                onChange={(e) =>
                  handleFilterChange("eventDate", e.target.value)
                }
              />
            </td>
            <td className="px-2 py-2 border-b">
              <input
                type="text"
                placeholder="Поиск по типу"
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.eventType}
                onChange={(e) =>
                  handleFilterChange("eventType", e.target.value)
                }
              />
            </td>
            <td className="px-2 py-2 border-b">
              <input
                type="text"
                placeholder="Поиск по № дела"
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.caseNumber}
                onChange={(e) =>
                  handleFilterChange("caseNumber", e.target.value)
                }
              />
            </td>
            <td className="px-2 py-2 border-b">
              <input
                type="text"
                placeholder="Поиск по сотруднику"
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.responsible}
                onChange={(e) =>
                  handleFilterChange("responsible", e.target.value)
                }
              />
            </td>
            <td className="px-2 py-2 border-b flex justify-center">
              <button
                type="button"
                className="cursor-pointer text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Найти
              </button>
            </td>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData?.map((item, index) => (
            <tr key={item.id}>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                <input type="checkbox" />
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                {formatDateFromLinesToDots(item.date) || "01.01.2023"}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                {item.type || "Заседание"}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                {item.case_num || "-"}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                {item.responsibleEmployee || "Иванов И.И."}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 border-b w-[20%]">
                <Link to={`/event/${item.id}`}>
                  [<span className="text-blue-500 underline">Изменить</span>]
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
