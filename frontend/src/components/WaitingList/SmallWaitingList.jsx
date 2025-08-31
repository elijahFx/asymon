import React from "react";
import WaitingRow from "./WaitingRow";
import Pagination from "../Pagination";

const SmallWaitingList = ({ place, selectedDate, waitings = [] }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  console.log(waitings);
  

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Получаем элементы для текущей страницы
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = waitings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(waitings.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={`container px-4 py-6 max-w-full`}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedDate ? (
              `${place === "waitings" ? "Лист ожидания" : "Просмотры"} на ${formatDate(selectedDate)}`
            ) : (
              place === "waitings" ? "Лист ожидания" : "Просмотры"
            )}
          </h2>
        </div>

        <div className="overflow-x-auto">
          {waitings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedDate 
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
              {waitings.length > itemsPerPage && (
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

export default SmallWaitingList;