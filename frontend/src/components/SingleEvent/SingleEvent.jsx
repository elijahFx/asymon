import React, { useEffect, useState } from "react";
import {
  Pen,
  Check,
  X,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useParams } from "react-router";
import {
  useGetSingleMonopolyEventQuery,
  useUpdateMonopolyEventMutation,
} from "../../apis/monopolyEventsApi";

import {
  useGetSingleBunkerEventQuery,
  useUpdateBunkerEventMutation,
} from "../../apis/bunkerEventsApi";

import {
  useGetSingleJungleEventQuery,
  useUpdateJungleEventMutation,
} from "../../apis/jungleEventsApi";

import { STATUS_COLORS } from "../../utils/types";

const SingleEvent = ({ type = "view", place }) => {
  const [mode, setMode] = useState(type);
  const [originalEventData, setOriginalEventData] = useState(null);
  const [eventData, setEventData] = useState({
    consumerName: "",
    phoneNumber: "",
    messenger: "",
    messengerNickname: "",
    date: "",
    start: "",
    end: "",
    peopleAmount: "",
    childrenAmount: "",
    status: "Новое",
    wishes: "",
    prepayment: "",
    discount: "",
    place: "",
    peopleTariff: "",
    childrenTariff: "",
    isAmeteur: false,
    isPaid: false,
    isBirthday: false,
    isExtr: false,
    childPlan: "",
    childAge: "",
    additionalTime: "",
    adultsWithChildrenAmount: "",
  });
  const [isFinanceCollapsed, setIsFinanceCollapsed] = useState(false);

  const { id } = useParams();

  const getQueryHooks = () => {
    switch (place) {
      case "monopoly":
        return {
          useGetQuery: useGetSingleMonopolyEventQuery,
          useUpdateMutation: useUpdateMonopolyEventMutation,
        };
      case "jungle":
        return {
          useGetQuery: useGetSingleJungleEventQuery,
          useUpdateMutation: useUpdateJungleEventMutation,
        };
      case "bunker":
        return {
          useGetQuery: useGetSingleBunkerEventQuery,
          useUpdateMutation: useUpdateBunkerEventMutation,
        };
      default:
        return {
          useGetQuery: useGetSingleMonopolyEventQuery,
          useUpdateMutation: useUpdateMonopolyEventMutation,
        };
    }
  };

  const { useGetQuery, useUpdateMutation } = getQueryHooks();

  const {
    data,
    isLoading: loaderForSingleEvent,
    error: errorForSingleEvent,
  } = useGetQuery(id);
  const [updateEvent] = useUpdateMutation();

  useEffect(() => {
    if (data) {
      setOriginalEventData(data);
      setEventData({
        ...eventData,
        ...data,
      });
    }
  }, [data]);

  const calculateFinancials = () => {
    const peopleCost =
      parseFloat(eventData.peopleAmount || 0) *
      parseFloat(eventData.peopleTariff || 0);
    const childrenCost =
      parseFloat(eventData.childrenAmount || 0) *
      parseFloat(eventData.childrenTariff || 0);
    const totalCost = peopleCost + childrenCost;
    const discountAmount =
      totalCost * (parseFloat(eventData.discount || 0) / 100);
    const finalCost = totalCost - discountAmount;
    const prepaymentAmount = parseFloat(eventData.prepayment || 0);
    const remainingAmount = finalCost - prepaymentAmount;

    return {
      totalCost,
      discountAmount,
      finalCost,
      prepaymentAmount,
      remainingAmount,
    };
  };

  const {
    totalCost,
    discountAmount,
    finalCost,
    prepaymentAmount,
    remainingAmount,
  } = calculateFinancials();

  const handleEditEvent = () => setMode("edit");

  const handleUpdate = async () => {
    try {
      await updateEvent({ id, ...eventData }).unwrap();
      setMode("view");
    } catch (err) {
      console.error("Failed to update event:", err);
    }
  };

  const handleCancel = () => {
    setEventData({ ...originalEventData });
    setMode("view");
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    const val = inputType === "checkbox" ? checked : value;
    setEventData((prev) => ({ ...prev, [name]: val }));
  };

  const toggleFinanceCollapse = () => {
    setIsFinanceCollapsed(!isFinanceCollapsed);
  };

  const renderSection = (title, children) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.filter(Boolean)} {/* 🔥 Вот это критически важно */}
        </div>
      </div>
    );
  };

  const renderField = (
    label,
    value,
    name,
    isEditable = false,
    type = "text"
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditable && mode !== "view" ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[40px] flex items-center">
          {value === 0 || value ? String(value) : "—"}
        </div>
      )}
    </div>
  );

  const renderSelectField = (label, name, options, selectedValue) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mode !== "view" ? (
        <select
          name={name}
          value={selectedValue}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[40px] flex items-center">
          {options.find((opt) => opt.value === selectedValue)?.label || "—"}
        </div>
      )}
    </div>
  );

  const renderTextArea = (label, value, name) => (
    <div className="space-y-1 col-span-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mode !== "view" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[60px]">
          {value || "—"}
        </div>
      )}
    </div>
  );

  const renderCheckbox = (label, name) => (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        name={name}
        checked={!!eventData[name]}
        onChange={handleChange}
        disabled={mode === "view"}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md mt-[11vh]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "view" ? "Детали записи" : "Редактирование записи"}
          </h2>
          <div
            className={`${
              STATUS_COLORS[eventData.status]
            } text-white px-4 py-1 rounded-full text-sm inline-flex items-center mt-2`}
          >
            {eventData.status}
          </div>
        </div>

        <div className="flex space-x-2">
          {mode === "view" ? (
            <button
              onClick={handleEditEvent}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Pen size={16} className="mr-2" />
              Редактировать
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Check size={16} className="mr-2" />
                Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <X size={16} className="mr-2" />
                Отменить
              </button>
            </>
          )}
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>

      {/* Финансовый блок с возможностью сворачивания */}
      <div className="mb-6 bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
        <button
          onClick={toggleFinanceCollapse}
          className="w-full flex justify-between items-center p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <DollarSign className="mr-2" size={18} />
            <h4 className="text-lg font-semibold text-blue-800">
              Итоговая стоимость
            </h4>
          </div>
          {isFinanceCollapsed ? (
            <ChevronDown size={20} className="text-blue-600" />
          ) : (
            <ChevronUp size={20} className="text-blue-600" />
          )}
        </button>

        {!isFinanceCollapsed && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">Общая стоимость</div>
                <div className="text-xl font-bold">
                  {totalCost.toFixed(2)} Br
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">
                  Скидка {eventData.discount || 0}%
                </div>
                <div className="text-xl font-bold text-red-500">
                  -{discountAmount.toFixed(2)} Br
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-blue-200 bg-blue-50">
                <div className="text-sm text-blue-600">Итого к оплате</div>
                <div className="text-2xl font-bold text-blue-700">
                  {finalCost.toFixed(2)} Br
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Предоплата</div>
                <div className="text-lg font-medium">
                  {eventData.prepayment
                    ? `${Number(eventData.prepayment).toFixed(2)} Br`
                    : "—"}
                </div>
              </div>
              {eventData.prepayment && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm text-gray-500">Остаток</div>
                  <div className="text-lg font-medium">
                    {remainingAmount.toFixed(2)} Br
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loaderForSingleEvent ? (
        <div className="text-center py-10">Загрузка данных...</div>
      ) : errorForSingleEvent ? (
        <div className="text-center py-10 text-red-500">
          Ошибка загрузки данных
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection("Основная информация", [
            renderField(
              "Имя клиента",
              eventData.consumerName,
              "consumerName",
              true
            ),
            renderField("Телефон", eventData.phoneNumber, "phoneNumber", true),
            renderField("Мессенджер", eventData.messenger, "messenger", true),
            renderField(
              "Ник в мессенджере",
              eventData.messengerNickname,
              "messengerNickname",
              true
            ),
          ])}

          {renderSection("Детали мероприятия", [
            renderField("Место проведения", eventData.place, "place", true),
            renderField("Дата игры", eventData.date, "date", true, "date"),
            renderField("Время начала", eventData.start, "start", true, "time"),
            renderField("Время окончания", eventData.end, "end", true, "time"),
          ])}

          {renderSection("Участники", [
            renderField(
              "Количество взрослых",
              eventData.peopleAmount,
              "peopleAmount",
              true,
              "number"
            ),
            renderField(
              "Тариф для взрослых",
              eventData.peopleTariff,
              "peopleTariff",
              true,
              "number"
            ),
            ...(eventData.isAmeteur
              ? [
                  renderField(
                    "Количество детей",
                    eventData.childrenAmount,
                    "childrenAmount",
                    true,
                    "number"
                  ),
                  renderField(
                    "Тариф для детей",
                    eventData.childrenTariff,
                    "childrenTariff",
                    true,
                    "number"
                  ),
                ]
              : []),
            renderSelectField(
              "Статус",
              "status",
              [
                { value: "Новое", label: "Новое" },
                { value: "Ждем предоплату", label: "Ждем предоплату" },
                { value: "Предоплата внесена", label: "Предоплата внесена" },
              ],
              eventData.status
            ),
          ])}

          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Дополнительные поля</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                renderCheckbox("Детский праздник", "isAmeteur"),
                renderCheckbox("Оплачено", "isPaid"),
                renderCheckbox("День рождения", "isBirthday"),
                renderCheckbox("EXTR", "isExtr"),
                ...(eventData.isAmeteur
                  ? [
                      renderSelectField(
                        "План для детей",
                        "childPlan",
                        [
                          { value: "Старт", label: "Старт" },
                          { value: "Стандарт", label: "Стандарт" },
                          { value: "ВИП", label: "ВИП" },
                        ],
                        eventData.childPlan
                      ),
                      renderField(
                        "Возраст детей",
                        eventData.childAge,
                        "childAge",
                        true,
                        "number"
                      ),
                      renderField(
                        "Доп. время аренды",
                        eventData.additionalTime,
                        "additionalTime",
                        true
                      ),
                      renderField(
                        "Взрослых с детьми",
                        eventData.adultsWithChildrenAmount,
                        "adultsWithChildrenAmount",
                        true,
                        "number"
                      ),
                    ]
                  : []),
              ].filter(Boolean)}


            </div>
          </div>

          {renderSection("Финансы", [
            renderField("Предоплата", eventData.prepayment, "prepayment", true),
            renderField("Скидка", eventData.discount, "discount", true),
          ])}

          {renderSection("Дополнительно", [
            renderTextArea("Пожелания", eventData.wishes, "wishes"),
          ])}
        </div>
      )}
    </div>
  );
};

export default SingleEvent;
