import React from "react";
import UserRow from "./UserRow";
import { useGetAllUsersQuery } from "../../apis/userApi";

const UsersTable = ({ users, onUpdate, onDelete }) => {
  const { data, isLoading, error } = useGetAllUsersQuery();

  return (
    <div className="overflow-x-auto mt-6 rounded-xl shadow border border-gray-300 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ник
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Должность
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Статус пользователя
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Верифицирован ли пользователь
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data && data.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
