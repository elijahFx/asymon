import React, { useState } from "react";
import { Check, X } from "lucide-react";

const AddEvent = () => {
  const [place, setPlace] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    start: "",
    end: "",
    status: "Новое",
    phoneNumber: "",
    consumerName: "",
    messenger: "",
    messengerNickname: "",
    isAmeteur: false,
    user_id: "",
    childrenTariff: "",
    childrenAmount: "",
    peopleAmount: "",
    wishes: "",
    peopleTariff: "",
    discount: "",
    prepayment: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlaceChange = (e) => {
    setPlace(e.target.value);
  };

  const handleSave = () => {
    console.log("Сохраняем мероприятие:", { place, ...formData });
  };

  const handleCancel = () => {
    setPlace("");
    setFormData({
      date: "",
      start: "",
      end: "",
      status: "Новое",
      phoneNumber: "",
      consumerName: "",
      messenger: "",
      messengerNickname: "",
      isAmeteur: false,
      user_id: "",
      childrenTariff: "",
      childrenAmount: "",
      peopleAmount: "",
      wishes: "",
      peopleTariff: "",
      discount: "",
      prepayment: "",
    });
  };

  const renderField = (label, value, name, isEditable = false, type = "text") => (
    <div className="flex items-start py-2 group">
      <div className="w-48 font-medium text-gray-700">{label}:</div>
      {isEditable ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      ) : (
        <div className="text-gray-900">{value || "—"}</div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white shadow rounded-md flex-1 mt-[11vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          Добавить новое мероприятие
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
            title="Сохранить"
          >
            <Check size={18} strokeWidth={2} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
            title="Отменить"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="space-y-4 text-sm text-gray-800">
        <div className="flex items-start py-2">
          <div className="w-48 font-medium text-gray-700">Место:</div>
          <select
            value={place}
            onChange={handlePlaceChange}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Выберите место</option>
            <option value="Монополия">Монополия</option>
            <option value="Джуманджи">Джуманджи</option>
            <option value="Бункер">Бункер</option>
          </select>
        </div>

        {place && (
          <>
            {renderField("Дата", formData.date, "date", true, "date")}
            {renderField("Начало", formData.start, "start", true, "time")}
            {renderField("Окончание", formData.end, "end", true, "time")}
            <div className="flex items-start py-2">
              <div className="w-48 font-medium text-gray-700">Статус:</div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="Новое">Новое</option>
                <option value="В работе">В работе</option>
                <option value="Запись подтверждена">Запись подтверждена</option>
              </select>
            </div>
            {renderField("Телефон", formData.phoneNumber, "phoneNumber", true)}
            {renderField("Имя потребителя", formData.consumerName, "consumerName", true)}
            {renderField("Мессенджер", formData.messenger, "messenger", true)}
            {renderField("Ник в мессенджере", formData.messengerNickname, "messengerNickname", true)}
            <div className="flex items-start py-2 group">
              <div className="w-48 font-medium text-gray-700">Новичок:</div>
              <input
                type="checkbox"
                name="isAmeteur"
                checked={formData.isAmeteur}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            {renderField("Тариф (дети)", formData.childrenTariff, "childrenTariff", true, "number")}
            {renderField("Количество детей", formData.childrenAmount, "childrenAmount", true, "number")}
            {renderField("Общее количество", formData.peopleAmount, "peopleAmount", true, "number")}
            {renderField("Пожелания", formData.wishes, "wishes", true)}
            {renderField("Тариф (взрослые)", formData.peopleTariff, "peopleTariff", true)}
            {renderField("Скидка", formData.discount, "discount", true)}
            {renderField("Предоплата", formData.prepayment, "prepayment", true)}
          </>
        )}
      </div>
    </div>
  );
};

export default AddEvent;
