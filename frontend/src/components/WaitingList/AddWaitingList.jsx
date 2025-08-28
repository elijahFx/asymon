import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAddWaitingMutation } from "../../apis/waitingsApi";
import { useAddViewMutation } from "../../apis/viewsApi";
import { useSelector } from "react-redux";
import { validatePhoneNumber } from "../../utils/formValidation";

const AddWaitingList = ({ place }) => {
  const user_id = useSelector((state) => state.auth.id);

  const initialState = {
    date: "",
    startTime: "19:00",
    endTime: "20:00",
    phoneNumber: "",
    consumerName: "",
    note: "",
    location: "",
  };

  const [addView, { error }] = useAddViewMutation();
  const [addWaiting] = useAddWaitingMutation();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Валидация телефона в реальном времени
    if (name === 'phoneNumber') {
      if (value && !validatePhoneNumber(value)) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Формат: +79001234567' }));
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: null }));
      }
    } else if (errors[name]) {
      // Убираем ошибку для других полей при изменении
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if(error) newErrors.message = "На это время уже есть мероприятие, либо необходим 29-минутный интервал";
    if (!formData.date) newErrors.date = "Укажите дату";
    
    // Валидация телефона
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Укажите телефон";
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = "Неверный формат телефона";
    }
    
    if (!formData.consumerName) newErrors.consumerName = "Укажите имя";
    if (!formData.location) newErrors.location = "Укажите место";
    
    if (place === "views") {
      if (!formData.startTime) newErrors.startTime = "Укажите время начала";
      if (!formData.endTime) newErrors.endTime = "Укажите время окончания";
      if (
        formData.startTime &&
        formData.endTime &&
        formData.startTime >= formData.endTime
      ) {
        newErrors.endTime = "Время окончания должно быть позже начала";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if(errors.message) {
        toast.error(errors.message);
        return;
      }
      toast.error("Пожалуйста, заполните обязательные поля правильно");
      return;
    }

    const payload = {
      date: formData.date,
      phone: formData.phoneNumber,
      name: formData.consumerName,
      location: formData.location,
      ...(place === "views" && {
        start: formData.startTime,
        end: formData.endTime,
        note: formData.note,
      }),
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
      setErrors({});
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
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
          )}
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
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        {place === "views" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Начало *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.startTime ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Окончание *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.endTime ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.endTime && (
                <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Телефон *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+79001234567"
            className={`w-full px-3 py-2 border ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            } rounded`}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
          )}
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
          {errors.consumerName && (
            <p className="text-red-500 text-xs mt-1">{errors.consumerName}</p>
          )}
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
            onClick={() => {
              setFormData(initialState);
              setErrors({});
            }}
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