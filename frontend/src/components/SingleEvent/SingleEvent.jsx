import React, { useEffect, useState } from "react";
import { Pen, Check, X, Plus } from "lucide-react";
import {
  useAddEventMutation,
  useGetSingleEventQuery,
  useUpdateEventMutation,
} from "../../apis/eventsApi";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

const SingleEvent = ({ type = "view" }) => {
  console.log(type);

  const [mode, setMode] = useState(type); // 'view', 'add' или 'edit'
  const [eventType, setEventType] = useState("");
  const [originalEventData, setOriginalEventData] = useState(null);
  const [eventData, setEventData] = useState({
    type: "",
    date: "",
    responsible: "",
    court: "",
    time: "",
    caseNumber: "",
    color: "",
  });

  console.log(mode);
  const { number } = useParams();

  const {
    data,
    isLoading: loaderForSingleEvent,
    error: errorForSingleEvent,
  } = useGetSingleEventQuery(number);
  const [updateEvent] = useUpdateEventMutation();

  useEffect(() => {
    if (type === "view" && data) {
      setOriginalEventData(data);
      setEventData({
        type: data?.type,
        date: data?.date,
        responsible: data?.responsibleEmployee,
        court: data?.court,
        time: data?.time,
        caseNumber: data?.case_num,
        color: data?.color,
      });
      setEventType(data?.type);
    }
  }, [type, data]);

  const user_id = useSelector((state) => state.auth.id);
  const fullName = useSelector((state) => state.auth.fullName);
  const [addEvent, { error, isLoading }] = useAddEventMutation();

  const handleEditEvent = () => {
    setMode("edit");
  };

  const handleAddEvent = () => {
    setMode("add");
    setEventType("");
    setEventData({
      type: "",
      date: "",
      responsible: "",
      court: "",
      time: "",
      caseNumber: "",
      color: "",
    });
  };

  const handleUpdate = async () => {
    try {
      await updateEvent({
        id: number,
        ...eventData,
        responsibleEmployee: eventData.responsible,
        case_num: eventData.caseNumber,
        color: eventData.color || "",
      }).unwrap();
      setMode("view");
    } catch (err) {
      console.error("Failed to update event:", err);
    }
  };

  const handleSave = async () => {
    if (!eventData.type || !eventData.date || !eventData.time) return;

    if (mode === "add") {
      await addEvent({
        user_id: user_id,
        type: eventData.type,
        date: eventData.date,
        time: eventData.time,
        responsibleEmployee: eventData.responsible,
        court: eventData.court || null,
        case_num: eventData.caseNumber || null,
        color: eventData?.color || null,
      }).unwrap();
    }

    setMode("view");
    setEventData({
      type: eventData.type,
      date: eventData.date,
      responsible: eventData.responsible,
      court: eventData.court,
      time: eventData.time,
      caseNumber: eventData.caseNumber,
    });
  };

  const handleCancel = () => {
    if (mode === "edit") {
      setEventData({
        type: originalEventData?.type,
        date: originalEventData?.date,
        responsible: originalEventData?.responsibleEmployee,
        court: originalEventData?.court,
        time: originalEventData?.time,
        caseNumber: originalEventData?.case_num,
      });
    }
    setMode("view");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setEventType(e.target.value);
    setEventData((prev) => ({ ...prev, type: e.target.value }));
  };

  const renderField = (label, value, name, isEditable = false) => (
    <div className="flex items-start py-2 group">
      <div className="w-48 font-medium text-gray-700">{label}:</div>
      {isEditable && mode !== "view" ? ( // Изменили условие
        <input
          type="text"
          name={name}
          value={value || ""} // Добавили fallback для value
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      ) : (
        <div className="text-gray-900">{value || "—"}</div> // Добавили fallback
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white shadow rounded-md flex-1 mt-[11vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          {mode === "view"
            ? "Событие"
            : mode === "edit"
            ? "Редактирование события"
            : "Добавить новое событие"}
        </h2>

        {mode === "view" ? (
          <div className="flex gap-2">
            <button
              onClick={handleEditEvent}
              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
              title="Редактировать"
            >
              <Pen size={18} strokeWidth={2} />
            </button>
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              <Plus size={18} strokeWidth={2} />
              Добавить событие
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={mode === "edit" ? handleUpdate : handleSave}
              className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
              title={mode === "edit" ? "Сохранить изменения" : "Сохранить"}
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
        )}
      </div>

      {mode === "view" ? (
        <div className="space-y-4 text-sm text-gray-800">
          {renderField("Тип события", eventData.type)}

          {eventData.type === "Дежурство" ? (
            <>
              {renderField("Дата", eventData.date)}
              {renderField("Ответственный сотрудник", eventData.responsible)}
            </>
          ) : (
            <>
              {renderField("Суд", eventData.court)}
              {renderField("Дата заседания", eventData.date)}
              {renderField("Время заседания", eventData.time)}
              {renderField("№ дела", eventData.caseNumber)}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-sm text-gray-800">
          <div className="flex items-start py-2">
            <div className="w-48 font-medium text-gray-700">Тип события:</div>
            <select
              value={eventType}
              onChange={handleTypeChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Выберите тип события</option>
              <option value="Дежурство">Дежурство</option>
              <option value="Судебное заседание">Судебное заседание</option>
            </select>
          </div>

          {eventType === "Дежурство" ? (
            <>
              {renderField("Дата", eventData.date, "date", true)}
              {renderField("Время", eventData.time, "time", true)}
              {renderField(
                "Ответственный сотрудник",
                eventData.responsible,
                "responsible",
                true
              )}
            </>
          ) : eventType === "Судебное заседание" ? (
            <>
             
              {renderField("Дата заседания", eventData.date, "date", true)}
              {renderField("Время заседания", eventData.time, "time", true)}
              {renderField("№ дела", eventData.caseNumber, "caseNumber", true)}
            </>
          ) : null}
        </div>
      )}

      <div className="flex gap-2 justify-end mt-6">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm"
          onClick={() => window.history.back()}
        >
          Вернуться
        </button>
      </div>
    </div>
  );
};

export default SingleEvent;
