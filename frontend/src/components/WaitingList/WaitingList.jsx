import React, { useState, useEffect } from "react";
import { useGetAllWaitingsQuery, useGetWaitingsByDateQuery } from "../../apis/waitingsApi";
import { useGetAllViewsQuery, useGetViewsByDateQuery } from "../../apis/viewsApi";
import WaitingRow from "./WaitingRow";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";

const WaitingList = ({ place, type, selectedDate = null }) => {
  const isDateMode = !!selectedDate;
  
  // Хуки для получения всех данных
  const {
    data: allWaitingsData,
    isLoading: isAllWaitingsLoading,
    error: allWaitingsError
  } = useGetAllWaitingsQuery(undefined, { skip: isDateMode });
  
  const {
    data: allViewsData,
    isLoading: isAllViewsLoading,
    error: allViewsError
  } = useGetAllViewsQuery(undefined, { skip: isDateMode });

  // Хуки для получения данных по дате
  const {
    data: dateWaitingsData,
    isLoading: isDateWaitingsLoading,
    error: dateWaitingsError,
    refetch: refetchDateWaitings
  } = useGetWaitingsByDateQuery(selectedDate, { skip: !isDateMode || !selectedDate });
  
  const {
    data: dateViewsData,
    isLoading: isDateViewsLoading,
    error: dateViewsError,
    refetch: refetchDateViews
  } = useGetViewsByDateQuery(selectedDate, { skip: !isDateMode || !selectedDate });

  // Выбираем нужные данные в зависимости от режима и типа
  const getItems = () => {
    if (isDateMode) {
      return place === "waitings" ? dateWaitingsData : dateViewsData;
    } else {
      return place === "waitings" ? allWaitingsData : allViewsData;
    }
  };

  const getIsLoading = () => {
    if (isDateMode) {
      return place === "waitings" ? isDateWaitingsLoading : isDateViewsLoading;
    } else {
      return place === "waitings" ? isAllWaitingsLoading : isAllViewsLoading;
    }
  };

  const getError = () => {
    if (isDateMode) {
      return place === "waitings" ? dateWaitingsError : dateViewsError;
    } else {
      return place === "waitings" ? allWaitingsError : allViewsError;
    }
  };

  const items = getItems() || [];
  const isLoading = getIsLoading();
  const error = getError();
  
  const [filters, setFilters] = useState({
    date: "",
    createdAt: "",
    phone: "",
    name: ""
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Обновляем данные при изменении selectedDate в date mode
  useEffect(() => {
    if (isDateMode && selectedDate) {
      if (place === "waitings") {
        refetchDateWaitings();
      } else {
        refetchDateViews();
      }
    }
  }, [selectedDate, isDateMode, place, refetchDateWaitings, refetchDateViews]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Функция для фильтрации (только в обычном режиме)
  const filterItems = (item) => {
    if (isDateMode) return true; // В date mode не фильтруем
    
    // Фильтр по дате
    if (filters.date && formatDate(item.date) !== formatDate(filters.date)) {
      return false;
    }
    
    // Фильтр по дате добавления
    if (filters.createdAt && formatDate(item.createdAt) !== formatDate(filters.createdAt)) {
      return false;
    }
    
    // Фильтр по телефону
    if (filters.phone && !item.phone?.includes(filters.phone)) {
      return false;
    }
    
    // Фильтр по имени
    if (filters.name && !item.name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    return true;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      date: "",
      createdAt: "",
      phone: "",
      name: ""
    });
    setCurrentPage(1);
  };

  // Фильтруем элементы (только в обычном режиме)
  const filteredItems = isDateMode ? items : items.filter(filterItems);
  
  // Получаем элементы для текущей страницы
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="text-center py-8">Загрузка данных...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>;

  return (
    <div className={`container px-4 py-6 ${selectedDate ? "" : "mt-[11vh]"} max-w-full`}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isDateMode ? (
              `${place === "waitings" ? "Лист ожидания" : "Просмотры"} на ${formatDate(selectedDate)}`
            ) : (
              place === "waitings" ? "Лист ожидания" : "Просмотры"
            )}
          </h2>
          {!isDateMode && (
            <Link
              to={`/${place}/add`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Добавить
            </Link>
          )}
        </div>

        {/* Блок фильтров (только в обычном режиме) */}
        {!isDateMode && (
          <div className="p-4 border-b grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата добавления</label>
              <input
                type="date"
                name="createdAt"
                value={filters.createdAt}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="text"
                name="phone"
                value={filters.phone}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Поиск по телефону"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Поиск по имени"
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
        )}

        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isDateMode 
                ? `В ${place === "waitings" ? "листе ожидания" : "просмотрах"} на этот день пусто`
                : "Нет данных для отображения"
              }
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    {place === "views" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Телефон
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
                  {currentItems.map((item) => (
                    <WaitingRow
                      key={item.id}
                      item={item}
                      formatDate={formatDate}
                      type={place}
                      place={place}
                      time={`${item.start} - ${item.end}`}
                    />
                  ))}
                </tbody>
              </table>

              {/* Пагинация */}
              {filteredItems.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingList;