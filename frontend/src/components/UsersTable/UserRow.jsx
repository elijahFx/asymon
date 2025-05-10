import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useDeleteUserMutation,
  useEditUserLikeAdminMutation,
} from "../../apis/userApi";

const ranks = ["Директор", "Заместитель директора", "Менеджер", "Сотрудник"];

const statuses = ["user", "admin"];

const UserRow = ({ user, onUpdate, onDelete }) => {
  const [editUser, setEditUser] = useState(user);

  console.log(editUser);

  const [editUserLikeAdmin, { isLoading, error }] =
    useEditUserLikeAdminMutation();

  const [deleteUser, { isLoading: deleteLoading, error: deleteError }] =
    useDeleteUserMutation();

  const handleInputChange = async (field, value) => {
    const confirmed = window.confirm("Вы уверены, что хотите изменить данные?");
    if (confirmed) {
      const updatedUser = { ...editUser, [field]: value };
      setEditUser(updatedUser);
      onUpdate(updatedUser);
      const result = await editUserLikeAdmin(updatedUser).unwrap();
      console.log(result);
    }
  };

  const handleDelete = async () => {
   const confirmed = window.confirm("Удалить пользователя?");
    if (confirmed) {
      const result = await deleteUser(editUser.id);
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{editUser.nickname}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {editUser.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={editUser.rank}
          onChange={(e) => handleInputChange("rank", e.target.value)}
          className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {ranks.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={editUser.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap flex justify-center">
        <input
          type="checkbox"
          checked={editUser.isVerified === true || editUser.isVerified === 1}
          onChange={(e) =>
            handleInputChange("isVerified", e.target.checked ? 1 : 0)
          }
          className="w-5 h-5 accent-blue-600"
        />
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 transition cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
