import React, { useState } from "react";
import { useGetEventsFromAllQuery } from "../../apis/monopolyEventsApi";
import SingleRow from "./SingleRow";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { calculateEventCost } from "../../utils/eventCalculations";

const List = () => {
  const { data: events, isLoading, error } = useGetEventsFromAllQuery();
  console.log(events);

  const [filters, setFilters] = useState({
    place: "Все",
    status: "Все",
    date: "",
    createdAt: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Количество элементов на странице

  // Функция для расчета общей стоимости
  const calculateTotalCost = (event) => {
    const costs = calculateEventCost(event);
    return costs.finalCost.toFixed(2);
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Функция для фильтрации мероприятий
  const filterEvents = (event) => {
    // Фильтр по месту
    if (filters.place !== "Все" && event.place !== filters.place) {
      return false;
    }

    // Фильтр по статусу
    if (filters.status !== "Все" && event.status !== filters.status) {
      return false;
    }

    // Фильтр по дате мероприятия
    if (filters.date && formatDate(event.date) !== formatDate(filters.date)) {
      return false;
    }

    // Фильтр по дате добавления
    if (
      filters.createdAt &&
      formatDate(event.createdAt) !== formatDate(filters.createdAt)
    ) {
      return false;
    }

    return true;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  const resetFilters = () => {
    setFilters({
      place: "Все",
      status: "Все",
      date: "",
      createdAt: "",
    });
    setCurrentPage(1); // Сбрасываем на первую страницу при сбросе фильтров
  };

  // Фильтруем события
  const filteredEvents = events?.filter(filterEvents) || [];

  // Получаем события для текущей страницы
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading)
    return <div className="text-center py-8">Загрузка данных...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки данных
      </div>
    );

  return (
    <div className="container px-4 py-8 mt-[11vh] max-w-full">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Все мероприятия</h2>
          <Link
            to="/add"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Добавить мероприятие
          </Link>
        </div>

        {/* Блок фильтров */}
        <div className="p-4 border-b grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Место
            </label>
            <select
              name="place"
              value={filters.place}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Все">Все</option>
              <option value="Монополия">Монополия</option>
              <option value="Джуманджи">Джуманджи</option>
              <option value="Бункер">Бункер</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Все">Все</option>
              <option value="Новое">Новое</option>
              <option value="Ждем предоплату">Ждем предоплату</option>
              <option value="Предоплата внесена">Предоплата внесена</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата мероприятия
            </label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата добавления
            </label>
            <input
              type="date"
              name="createdAt"
              value={filters.createdAt}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end justify-center">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Место
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Добавлено
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEvents.map((event) => (
                <SingleRow
                  key={event.id}
                  event={event}
                  calculateTotalCost={calculateTotalCost}
                  formatDate={formatDate}
                  type={event.type}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {filteredEvents.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default List;
