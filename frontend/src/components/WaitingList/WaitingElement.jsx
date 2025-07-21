// WaitingElement.jsx
import React, { useState, useEffect } from "react";
import { Pen, Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useGetWaitingByIdQuery,
  useUpdateWaitingMutation,
} from "../../apis/waitingsApi";
import {
  useGetViewByIdQuery,
  useUpdateViewMutation,
} from "../../apis/viewsApi";


const WaitingElement = ({ place }) => {
  const { id } = useParams();
  const [mode, setMode] = useState("view");
  const [eventData, setEventData] = useState({
    date: "",
    time: "",
    phoneNumber: "",
    consumerName: "",
    note: "",
  });
  const [originalData, setOriginalData] = useState(null);

  const isView = place === "views";
  const isWaiting = place === "waitings";

  const { data, isLoading, error } = isView
    ? useGetViewByIdQuery(id)
    : useGetWaitingByIdQuery(id);

    console.log(data);
    

  const [updateView] = useUpdateViewMutation();
  const [updateWaiting] = useUpdateWaitingMutation();

  

  useEffect(() => {
    if (data) {
      setOriginalData(data);
      setEventData({ ...data });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      if (isView) await updateView({ id, ...eventData }).unwrap();
      else await updateWaiting({ id, ...eventData }).unwrap();
      setMode("view");
    } catch (err) {
      console.error("Ошибка обновления:", err);
    }
  };

  const handleCancel = () => {
    setEventData({ ...originalData });
    setMode("view");
  };

  const renderField = (label, name, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mode === "edit" ? (
        <input
          type={type}
          name={name}
          value={eventData[name] || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[40px]">
          {eventData[name] || "—"}
        </div>
      )}
    </div>
  );

  const renderTextArea = (label, name) => (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mode === "edit" ? (
        <textarea
          name={name}
          value={eventData[name] || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[60px]">
          {eventData[name] || "—"}
        </div>
      )}
    </div>
  );

  if (isLoading) return <div className="text-center py-10">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Ошибка загрузки</div>
    );

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md mt-[11vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === "view" ? "Информация" : "Редактирование"}
        </h2>
        <div className="flex gap-2">
          {mode === "view" ? (
            <button
              onClick={() => setMode("edit")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Pen size={16} className="mr-2" /> Редактировать
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check size={16} className="mr-2" /> Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                <X size={16} className="mr-2" /> Отменить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField("Дата", "date", "date")}
        {isView && renderField("Время", "time", "time")}
        {renderField("Телефон", "phone")}
        {renderField("Имя", "name")}
        {isView && renderTextArea("Примечание", "note")}
      </div>
    </div>
  );
};

export default WaitingElement;
