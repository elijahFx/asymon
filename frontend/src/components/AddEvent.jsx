import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  User,
  MessageSquare,
  Gift,
  Users,
  FileText,
  Percent,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useAddBunkerEventMutation } from "../apis/bunkerEventsApi";
import { useAddJungleEventMutation } from "../apis/jungleEventsApi";
import { useAddMonopolyEventMutation } from "../apis/monopolyEventsApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MESSENGERS = [
  { value: "Viber", label: "Viber" },
  { value: "Telegram", label: "Telegram" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Instagram", label: "Instagram" },
  { value: "ВКонтакте", label: "ВКонтакте" },
];

const ADULT_TARIFFS = [
  { value: "Тариф 1", label: "Тариф 1" },
  { value: "Тариф 2", label: "Тариф 2" },
  { value: "Тариф 3", label: "Тариф 3" },
];

const AddEvent = () => {
  const user_id = useSelector((state) => state.auth.id);
  const navigate = useNavigate();

  const initialState = {
    date: "",
    start: "",
    end: "",
    status: "Новое",
    phoneNumber: "",
    consumerName: "",
    messenger: "",
    messengerNickname: "",
    isAmeteur: false,
    isPaid: false,
    user_id: user_id,
    childrenTariff: "",
    childrenAmount: "",
    peopleAmount: "",
    wishes: "",
    peopleTariff: "",
    discount: "",
    prepayment: "",
    isBirthday: false,
    isExtr: false,
    childPlan: "",
    adultsWithChildrenAmount: "",
    additionalTime: "",
    childAge: "",
  };

  const [addBunker] = useAddBunkerEventMutation();
  const [addJungle] = useAddJungleEventMutation();
  const [addMonopoly] = useAddMonopolyEventMutation();

  const [place, setPlace] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [finalCost, setFinalCost] = useState(0);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      isAmeteur: ageGroup === "Детский",
    }));
  }, [ageGroup]);

  useEffect(() => {
    const childrenCost =
      (parseFloat(formData.childrenTariff) || 0) *
      (parseInt(formData.childrenAmount) || 0);
    const adultsCost =
      (parseFloat(formData.peopleTariff) || 0) *
      ((parseInt(formData.peopleAmount) || 0) -
        (parseInt(formData.childrenAmount) || 0));
    const calculatedTotal = childrenCost + adultsCost;
    setTotalCost(calculatedTotal);

    const discountValue = parseFloat(formData.discount) || 0;
    const calculatedFinal =
      calculatedTotal - (calculatedTotal * discountValue) / 100;

    const prepayment = formData.isPaid
      ? parseFloat(formData.prepayment) || 0
      : 0;
    setFinalCost(calculatedFinal);
  }, [
    formData.childrenTariff,
    formData.childrenAmount,
    formData.peopleAmount,
    formData.peopleTariff,
    formData.discount,
    formData.prepayment,
    formData.isPaid,
  ]);

  const validateForm = () => {
    const newErrors = {};
    const errorMessages = [];

    if (!place) {
      newErrors.place = "Выберите место проведения";
      errorMessages.push("• Место проведения");
    }

    if (!ageGroup) {
      newErrors.ageGroup = "Выберите возрастную группу";
      errorMessages.push("• Возрастная группа");
    }

    if (!formData.date) {
      newErrors.date = "Укажите дату мероприятия";
      errorMessages.push("• Дата мероприятия");
    }

    if (!formData.start) {
      newErrors.start = "Укажите время начала";
      errorMessages.push("• Время начала");
    }

    if (!formData.end) {
      newErrors.end = "Укажите время окончания";
      errorMessages.push("• Время окончания");
    }

    if (!formData.consumerName) {
      newErrors.consumerName = "Укажите имя клиента";
      errorMessages.push("• Имя клиента");
    }

    const hasMessenger = formData.messenger && formData.messengerNickname;
    if (!formData.phoneNumber && !hasMessenger) {
      newErrors.contact = "Укажите телефон или мессенджер и ник";
      errorMessages.push("• Телефон или мессенджер+ник");
    }

    if (ageGroup === "Взрослый" && !formData.peopleAmount) {
      newErrors.peopleAmount = "Укажите количество человек";
      errorMessages.push("• Количество человек");
    }

    if (ageGroup === "Взрослый" && !formData.peopleTariff) {
      newErrors.peopleTariff = "Укажите тариф для взрослых";
      errorMessages.push("• Тариф для взрослых");
    }

    setErrors(newErrors);

    if (errorMessages.length > 0) {
      toast.error(
        <div>
          <div className="font-bold mb-2">Заполните обязательные поля:</div>
          <div className="space-y-1">
            {errorMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlaceChange = (e) => {
    setPlace(e.target.value);
    setErrors({});
  };

  const handleAgeGroupChange = (e) => {
    setAgeGroup(e.target.value);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      switch (place) {
        case "Монополия":
          console.log(formData);
          await addMonopoly(formData).unwrap();
          break;
        case "Джуманджи":
          await addJungle(formData).unwrap();
          break;
        case "Бункер":
          await addBunker(formData).unwrap();
          break;
        default:
          break;
      }

      toast.success("Мероприятие успешно добавлено!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setFormData(initialState);
      setAgeGroup("");
      navigate("/main");
    } catch (error) {
      toast.error(`Ошибка при сохранении мероприятия: ${error.data.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleCancel = () => {
    setPlace("");
    setAgeGroup("");
    setFormData(initialState);
    setTotalCost(0);
    setFinalCost(0);
    setErrors({});
  };

  const renderField = (
    label,
    value,
    name,
    isEditable = false,
    type = "text",
    icon = null,
    required = false
  ) => (
    <div className="flex items-center py-2 group">
      {icon && <span className="text-gray-400 mr-2">{icon}</span>}
      <div className="w-48 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}:
      </div>
      {isEditable ? (
        type === "checkbox" ? (
          <div className="w-full">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ) : type === "textarea" ? (
          <div className="w-full">
            <textarea
              name={name}
              value={value || ""}
              onChange={handleChange}
              className={`w-full border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
              rows={3}
            />
            {errors[name] && (
              <div className="text-red-500 text-xs mt-1">{errors[name]}</div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={handleChange}
              className={`w-full border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            />
            {errors[name] && (
              <div className="text-red-500 text-xs mt-1">{errors[name]}</div>
            )}
          </div>
        )
      ) : (
        <div className="text-gray-900">{value || "—"}</div>
      )}
    </div>
  );

  const renderTariffField = () => (
    <div className="flex items-center py-2">
      <div className="w-48 font-medium text-gray-700 flex items-center">
        <DollarSign className="mr-2" size={16} />
        Тариф (взрослые):
      </div>
      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[40px] flex items-center">
        {formData.peopleTariff || "—"}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex-1 mt-[11vh] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Добавить новое мероприятие
        </h2>
      </div>

      <div className="space-y-6">
        {/* Основная информация */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <CalendarIcon className="mr-2" size={18} />
            Основная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center py-2">
                <div className="w-48 font-medium text-gray-700 flex items-center">
                  <CalendarIcon className="mr-2" size={16} />
                  Место<span className="text-red-500 ml-1">*</span>:
                </div>
                <div className="w-full">
                  <select
                    value={place}
                    onChange={handlePlaceChange}
                    className={`w-full border ${
                      errors.place ? "border-red-500" : "border-gray-300"
                    } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  >
                    <option value="">Выберите место</option>
                    <option value="Монополия">Монополия</option>
                    <option value="Джуманджи">Джуманджи</option>
                    <option value="Бункер">Бункер</option>
                  </select>
                  {errors.place && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.place}
                    </div>
                  )}
                </div>
              </div>

              {place && (
                <>
                  <div className="flex items-center py-2">
                    <div className="w-48 font-medium text-gray-700 flex items-center">
                      <Users className="mr-2" size={16} />
                      Возрастная группа <span className="text-red-500 ">*</span>
                      <span className="text-gray-700">:</span>
                    </div>
                    <div className="w-full">
                      <select
                        value={ageGroup}
                        onChange={handleAgeGroupChange}
                        className={`w-full border ${
                          errors.ageGroup ? "border-red-500" : "border-gray-300"
                        } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                      >
                        <option value="">Выберите группу</option>
                        <option value="Детский">Детский</option>
                        <option value="Взрослый">Взрослый</option>
                      </select>
                      {errors.ageGroup && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.ageGroup}
                        </div>
                      )}
                    </div>
                  </div>

                  {ageGroup && (
                    <>
                      {renderField(
                        "Дата",
                        formData.date,
                        "date",
                        true,
                        "date",
                        <CalendarIcon size={16} />,
                        true
                      )}
                      {renderField(
                        "Начало",
                        formData.start,
                        "start",
                        true,
                        "time",
                        <Clock size={16} />,
                        true
                      )}
                      {renderField(
                        "Окончание",
                        formData.end,
                        "end",
                        true,
                        "time",
                        <Clock size={16} />,
                        true
                      )}

                      <div className="flex items-center py-2">
                        <div className="w-48 font-medium text-gray-700">
                          Статус:
                        </div>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          <option value="Новое">Новое</option>
                          <option value="Ждем предоплату">
                            Ждем предоплату
                          </option>
                          <option value="Предоплата внесена">
                            Предоплата внесена
                          </option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {ageGroup && (
              <div className="">
                <h4 className="font-medium text-gray-700 mb-2">
                  Информация о клиенте
                </h4>
                {renderField(
                  "Телефон",
                  formData.phoneNumber,
                  "phoneNumber",
                  true,
                  "tel",
                  <Phone size={16} />,
                  !(formData.messenger && formData.messengerNickname)
                )}
                {renderField(
                  "Имя",
                  formData.consumerName,
                  "consumerName",
                  true,
                  "text",
                  <User size={16} />,
                  true
                )}
                <div className="flex items-center py-2">
                  <div className="w-48 font-medium text-gray-700 flex items-center">
                    <MessageSquare className="mr-2" size={16} />
                    Мессенджер<span className="text-red-500 ml-1">*</span>:
                  </div>
                  <div className="w-full">
                    <select
                      name="messenger"
                      value={formData.messenger || ""}
                      onChange={handleChange}
                      className={`w-full border ${
                        errors.messenger ? "border-red-500" : "border-gray-300"
                      } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                      required={!formData.phoneNumber}
                    >
                      <option value="">Выберите мессенджер</option>
                      {MESSENGERS.map((messenger) => (
                        <option key={messenger.value} value={messenger.value}>
                          {messenger.label}
                        </option>
                      ))}
                    </select>
                    {errors.messenger && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.messenger}
                      </div>
                    )}
                  </div>
                </div>
                {renderField(
                  "Ник в мессенджере",
                  formData.messengerNickname,
                  "messengerNickname",
                  true,
                  "text",
                  <MessageSquare size={16} />,
                  !formData.phoneNumber
                )}
                {errors.contact && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.contact}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {ageGroup && (
          <>
            {/* Информация о мероприятии */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Gift className="mr-2" size={18} />
                Информация о мероприятии
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {ageGroup === "Детский" && (
                    <>
                      {renderField(
                        "Тариф (дети)",
                        formData.childrenTariff,
                        "childrenTariff",
                        true,
                        "number",
                        <DollarSign size={16} />,
                        true
                      )}
                      {renderField(
                        "Количество детей",
                        formData.childrenAmount,
                        "childrenAmount",
                        true,
                        "number",
                        <Users size={16} />,
                        true
                      )}

                      <div className="flex items-center py-2 group">
                        <Gift className="text-gray-400 mr-2" />
                        <div className="w-48 font-medium text-gray-700">
                          План (дети):
                        </div>
                        <div className="w-full">
                          <select
                            name="childPlan"
                            value={formData.childPlan || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          >
                            <option value="">Выберите план</option>
                            <option value="Старт">Старт</option>
                            <option value="Стандарт">Стандарт</option>
                            <option value="ВИП">ВИП</option>
                          </select>
                        </div>
                      </div>

                      {renderField(
                        "Количество взрослых с детьми",
                        formData.adultsWithChildrenAmount,
                        "adultsWithChildrenAmount",
                        true,
                        "number",
                        <Users size={16} />,
                        false
                      )}

                      {renderField(
                        "Доп. время аренды (мин)",
                        formData.additionalTime,
                        "additionalTime",
                        true,
                        "number",
                        <Clock size={16} />,
                        false
                      )}

                      {renderField(
                        "Возраст детей",
                        formData.childAge,
                        "childAge",
                        true,
                        "text",
                        <User size={16} />,
                        false
                      )}
                    </>
                  )}
                  {renderField(
                    "Общее количество",
                    formData.peopleAmount,
                    "peopleAmount",
                    true,
                    "number",
                    <Users size={16} />,
                    true
                  )}
                </div>

                <div>
                  {ageGroup === "Взрослый" && (
                    <div className="flex items-center py-2">
                      <div className="w-48 font-medium text-gray-700 flex items-center">
                        <DollarSign className="mr-2" size={16} />
                        Тариф (взрослые)
                        <span className="text-red-500 ml-1">*</span>:
                      </div>
                      <div className="w-full">
                        <select
                          name="peopleTariff"
                          value={formData.peopleTariff || ""}
                          onChange={handleChange}
                          className={`w-full border ${
                            errors.peopleTariff
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                          required
                        >
                          <option value="">Выберите тариф</option>
                          {ADULT_TARIFFS.map((tariff) => (
                            <option key={tariff.value} value={tariff.value}>
                              {tariff.label}
                            </option>
                          ))}
                        </select>
                        {errors.peopleTariff && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.peopleTariff}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {renderField(
                    "Скидка (%)",
                    formData.discount,
                    "discount",
                    true,
                    "number",
                    <Percent size={16} />
                  )}
                  {renderField(
                    "Предоплата",
                    formData.prepayment,
                    "prepayment",
                    true,
                    "number",
                    <CreditCard size={16} />
                  )}
                </div>
              </div>

              <div className="mt-4">
                {renderField(
                  "Пожелания",
                  formData.wishes,
                  "wishes",
                  true,
                  "textarea",
                  <FileText size={16} />
                )}
              </div>

              {/* Блок с итоговой стоимостью */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <DollarSign className="mr-2" size={18} />
                  Итоговая стоимость
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-500">Общая стоимость</div>
                    <div className="text-xl font-bold">
                      {totalCost.toFixed(2)} Br
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-500">
                      Скидка {formData.discount || 0}%
                    </div>
                    <div className="text-xl font-bold text-red-500">
                      -
                      {(
                        (totalCost * (parseFloat(formData.discount) || 0)) /
                        100
                      ).toFixed(2)}{" "}
                      Br
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
                      {formData.isPaid && formData.prepayment
                        ? `${Number(formData.prepayment).toFixed(2)} Br`
                        : "—"}
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-500">Остаток</div>
                    <div className="text-lg font-medium">
                      {formData.isPaid && formData.prepayment
                        ? (
                            finalCost - (parseFloat(formData.prepayment) || 0)
                          ).toFixed(2)
                        : finalCost.toFixed(2)}{" "}
                      Br
                    </div>
                  </div>
                </div>

                {/* Чекбокс "Оплачено" */}
                <div className="mt-4 flex items-center">
                  <div className="w-48 font-medium text-gray-700">
                    Оплачено:
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPaid"
                      checked={formData.isPaid || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {formData.isPaid ? "Да" : "Нет"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="w-48 font-medium text-gray-700">
                    День рождения:
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isBirthday"
                      checked={formData.isBirthday || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {formData.isBirthday ? "Да" : "Нет"}
                    </span>
                  </div>
                </div>

                {/* Чекбокс "EXTR" */}
                <div className="mt-2 flex items-center">
                  <div className="w-48 font-medium text-gray-700">EXTR:</div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isExtr"
                      checked={formData.isExtr || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {formData.isExtr ? "Да" : "Нет"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {ageGroup && (
        <div className="flex space-x-2 ml-1 pl-6">
          <button
            onClick={handleSave}
            className="cursor-pointer p-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition flex items-center"
            title="Сохранить"
          >
            <Check size={18} strokeWidth={2} className="mr-1" />
            Сохранить
          </button>
          <button
            onClick={handleCancel}
            className="cursor-pointer p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center"
            title="Отменить"
          >
            <X size={18} strokeWidth={2} className="mr-1" />
            Отменить
          </button>
        </div>
      )}
    </div>
  );
};

export default AddEvent;
