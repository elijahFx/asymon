import React from "react";
import { useGetBalanceQuery } from "../../apis/smsApi";
import { ArrowUpCircle } from "lucide-react"; // Импортируем иконку

const UserBalance = () => {
  const { data: balanceData, isLoading, isError } = useGetBalanceQuery();

  if (isLoading)
    return <div className="text-sm text-gray-500">Загрузка баланса...</div>;
  if (isError)
    return <div className="text-sm text-red-500">Ошибка загрузки баланса</div>;

  // Форматирование суммы с разделителями тысяч и двумя знаками после запятой
  const formatBalance = (amount) => {
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mt-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-700">Ваш баланс:</h3>
          <p className="text-2xl font-bold text-blue-600">
            {balanceData?.balance ? formatBalance(balanceData.balance) : "0,00"}{" "}
            Br
          </p>
        </div>
        <div className="text-right">
          <h3 className="font-medium text-gray-700">Доступно SMS:</h3>
          <p className="text-2xl font-bold text-green-600">
            {balanceData?.credits || 0}
          </p>
        </div>
      </div>

      {/* Кнопка пополнения баланса */}
      <a
        target="_blank"
        href="https://cab.rocketsms.by/payments" // Укажите правильный путь к странице пополнения
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ArrowUpCircle className="w-5 h-5" />
        Пополнить баланс
      </a>
    </div>
  );
};

export default UserBalance;
