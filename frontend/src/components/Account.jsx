import React, { useRef, useState } from "react";
import { Pencil, Save } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  useUploadAvatarMutation,
  useUpdateUserMutation,
} from "../apis/userApi";
import { setCredentials } from "../slices/authSlice";
import { formatDate } from "../utils/dates";
import UsersTable from "./UsersTable/UsersTable";
import userList from "../utils/userList";

const ranks = [
  "Председатель Правления",
  "Заместитель Председателя Правления",
  "Ведущий юрисконсульт",
  "Начальник юридического отдела",
  "Заместитель начальника юридического отдела",
  "Юрисконсульт",
];

const statuses = ["user", "admin"];

const Account = () => {
  const createdAt = useSelector((state) => state.auth.createdAt);
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth);
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateUser] = useUpdateUserMutation();

  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({
    id: userData.id,
    nickname: userData.user,
    rank: userData.rank,
    status: userData.status,
    createdAt: "2024-12-01",
    avatarUrl: userData.avatar,
    fullName: userData.fullName,
  });

  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      console.log({
        fullName: user.fullName,
        rank: user.rank,
        status: user.status,
        nickname: user.nickname,
      });

      const result = await updateUser({
        fullName: user.fullName,
        rank: user.rank,
        status: user.status,
        nickname: user.nickname,
      }).unwrap();
      dispatch(setCredentials(result));
      setEditMode(false);
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        const result = await uploadAvatar(formData).unwrap();
        setUser((prev) => ({ ...prev, avatarUrl: result.avatar }));
      } catch (error) {
        console.error("Ошибка загрузки аватара:", error);
      }
    }
  };

  return (
    <div className="p-6 w-full h-full flex flex-col mt-[11vh]">
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-center relative border border-gray-200 dark:border-gray-700 transition-all w-full">
        {/* Edit/Save Toggle */}
        <button
          onClick={editMode ? handleSave : () => setEditMode(true)}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
        >
          {editMode ? <Save size={20} /> : <Pencil size={20} />}
        </button>

        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt="User avatar"
            className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
          />
          {editMode && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-full shadow"
              >
                Изменить
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-3 text-center sm:text-left">
          {editMode ? (
            <div className="space-y-3">
              <input
                type="text"
                value={user.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Nickname"
              />

              <select
                value={user.rank}
                onChange={(e) => handleChange("rank", e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {ranks.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>

              <select
                value={user.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.nickname}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {user.id}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-300">
                <span className="font-medium">ФИО:</span> {user.fullName}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-300">
                <span className="font-medium">Ранг:</span> {user.rank}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-300">
                <span className="font-medium">Статус:</span>{" "}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.status === "admin"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {user.status}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Аккаунт создан: {formatDate(createdAt)}
              </p>
            </>
          )}
        </div>
      </div>

      <UsersTable
        users={userList}
        onUpdate={(updatedUser) => console.log("Обновить", updatedUser)}
        onDelete={(id) => console.log("Удалить пользователя с ID:", id)}
      />
      
    </div>
  );
};

export default Account;
