import React, { useState } from "react";
import {
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAddWaitingMutation } from "../../apis/waitingsApi";
import { useAddViewMutation } from "../../apis/viewsApi";
import { useSelector } from "react-redux";

const AddWaitingList = ({ place }) => {
  const user_id = useSelector((state) => state.auth.id);

  const initialState = {
    date: "",
    time: "",
    phoneNumber: "",
    consumerName: "",
    note: "",
    location: "", // 🔥 Добавлено
  };

  const [addView] = useAddViewMutation();
  const [addWaiting] = useAddWaitingMutation();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Укажите дату";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Укажите телефон";
    if (!formData.consumerName) newErrors.consumerName = "Укажите имя";
    if (!formData.location) newErrors.location = "Укажите место"; // 🔥
    if (place === "views" && !formData.time) newErrors.time = "Укажите время";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Пожалуйста, заполните обязательные поля");
      return;
    }

    const payload = {
      date: formData.date,
      phone: formData.phoneNumber,
      name: formData.consumerName,
      location: formData.location, // 🔥
      ...(place === "views" && { time: formData.time, note: formData.note }),
      place,
      user_id: user_id,
    };

    try {
      if (place === "waitings") {
        await addWaiting(payload).unwrap();
        toast.success("Добавлено в лист ожидания");
      } else {
        await addView(payload).unwrap();
        toast.success("Просмотр успешно добавлен");
      }
      setFormData(initialState);
    } catch (error) {
      toast.error("Ошибка при сохранении");
      console.error(error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full mt-[11vh]">
      <h2 className="text-xl font-semibold mb-4">
        {place === "waitings"
          ? "Добавить в лист ожидания"
          : "Добавить просмотр"}
      </h2>

      <div className="space-y-4">

        {/* 🔥 Выпадающий список мест */}
        <div>
          <label className="block text-sm font-medium">Место *</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.location ? "border-red-500" : "border-gray-300"
            } rounded`}
          >
            <option value="">Выберите место</option>
            <option value="Монополия">Монополия</option>
            <option value="Джуманджи">Джуманджи</option>
            <option value="Бункер">Бункер</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Дата *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.date ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
        </div>

        {place === "views" && (
          <div>
            <label className="block text-sm font-medium">Время *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.time ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Телефон *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Имя *</label>
          <input
            type="text"
            name="consumerName"
            value={formData.consumerName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.consumerName ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
        </div>

        {place === "views" && (
          <div>
            <label className="block text-sm font-medium">Примечание</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          >
            <Check size={16} className="mr-2" /> Сохранить
          </button>
          <button
            onClick={() => setFormData(initialState)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded flex items-center"
          >
            <X size={16} className="mr-2" /> Очистить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWaitingList;
