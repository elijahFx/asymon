import React, { useState, useEffect } from "react";
import { Check, X, Calendar, Clock, Phone, User, MessageSquare, Gift, Users, FileText, Percent, DollarSign, CreditCard } from "lucide-react";
import { useAddBunkerEventMutation } from "../apis/bunkerEventsApi";
import { useAddJungleEventMutation } from "../apis/jungleEventsApi";
import { useAddMonopolyEventMutation } from "../apis/monopolyEventsApi";

const AddEvent = () => {

  const [ addBunker, { data: bunkerData, isLoading: dataLoading }] = useAddBunkerEventMutation()
  const [ addJungle, { data: jungleData, isLoading: jungleLoading }] = useAddJungleEventMutation()
  const [ addMonopoly, { data: monopolyData, isLoading: monopolyLoading }] = useAddMonopolyEventMutation()

  const [place, setPlace] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [finalCost, setFinalCost] = useState(0);
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

  // Расчет итоговой стоимости
  useEffect(() => {
    const childrenCost = (parseFloat(formData.childrenTariff) || 0) * (parseInt(formData.childrenAmount) || 0);
    const adultsCost = (parseFloat(formData.peopleTariff) || 0) * ((parseInt(formData.peopleAmount) || 0) - (parseInt(formData.childrenAmount) || 0));
    const calculatedTotal = childrenCost + adultsCost;
    setTotalCost(calculatedTotal);

    const discountValue = (parseFloat(formData.discount) || 0);
    const calculatedFinal = calculatedTotal - (calculatedTotal * discountValue / 100);
    setFinalCost(calculatedFinal);
  }, [formData.childrenTariff, formData.childrenAmount, formData.peopleAmount, formData.peopleTariff, formData.discount]);

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
    console.log("Сохраняем мероприятие:", { place, ...formData, totalCost, finalCost });
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
    setTotalCost(0);
    setFinalCost(0);
  };

  const renderField = (label, value, name, isEditable = false, type = "text", icon = null) => (
    <div className="flex items-center py-2 group">
      {icon && <span className="text-gray-400 mr-2">{icon}</span>}
      <div className="w-48 font-medium text-gray-700">{label}:</div>
      {isEditable ? (
        type === "textarea" ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows={3}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        )
      ) : (
        <div className="text-gray-900">{value || "—"}</div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex-1 mt-[11vh] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Добавить новое мероприятие
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition flex items-center"
            title="Сохранить"
          >
            <Check size={18} strokeWidth={2} className="mr-1" />
            Сохранить
          </button>
          <button
            onClick={handleCancel}
            className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center"
            title="Отменить"
          >
            <X size={18} strokeWidth={2} className="mr-1" />
            Отменить
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Основная информация */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Calendar className="mr-2" size={18} />
            Основная информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center py-2">
                <div className="w-48 font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Место:
                </div>
                <select
                  value={place}
                  onChange={handlePlaceChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Выберите место</option>
                  <option value="Монополия">Монополия</option>
                  <option value="Джуманджи">Джуманджи</option>
                  <option value="Бункер">Бункер</option>
                </select>
              </div>
              
              {place && (
                <>
                  {renderField("Дата", formData.date, "date", true, "date", <Calendar size={16} />)}
                  {renderField("Начало", formData.start, "start", true, "time", <Clock size={16} />)}
                  {renderField("Окончание", formData.end, "end", true, "time", <Clock size={16} />)}
                  
                  <div className="flex items-center py-2">
                    <div className="w-48 font-medium text-gray-700">Статус:</div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="Новое">Новое</option>
                      <option value="В работе">В работе</option>
                      <option value="Запись подтверждена">Запись подтверждена</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            
            {place && (
              <div className="">
                <h4 className="font-medium text-gray-700 mb-2">Информация о клиенте</h4>
                {renderField("Телефон", formData.phoneNumber, "phoneNumber", true, "tel", <Phone size={16} />)}
                {renderField("Имя", formData.consumerName, "consumerName", true, "text", <User size={16} />)}
                {renderField("Мессенджер", formData.messenger, "messenger", true, "text", <MessageSquare size={16} />)}
                {renderField("Ник в мессенджере", formData.messengerNickname, "messengerNickname", true, "text", <MessageSquare size={16} />)}
                
                
              </div>
            )}
          </div>
        </div>

        {place && (
          <>
            {/* Информация о мероприятии */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Gift className="mr-2" size={18} />
                Информация о мероприятии
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {renderField("Тариф (дети)", formData.childrenTariff, "childrenTariff", true, "number", <DollarSign size={16} />)}
                  {renderField("Количество детей", formData.childrenAmount, "childrenAmount", true, "number", <Users size={16} />)}
                  {renderField("Общее количество", formData.peopleAmount, "peopleAmount", true, "number", <Users size={16} />)}
                </div>
                
                <div>
                  {renderField("Тариф (взрослые)", formData.peopleTariff, "peopleTariff", true, "number", <DollarSign size={16} />)}
                  {renderField("Скидка (%)", formData.discount, "discount", true, "number", <Percent size={16} />)}
                  {renderField("Предоплата", formData.prepayment, "prepayment", true, "number", <CreditCard size={16} />)}
                </div>
              </div>
              
              <div className="mt-4">
                {renderField("Пожелания", formData.wishes, "wishes", true, "textarea", <FileText size={16} />)}
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
                    <div className="text-xl font-bold">{totalCost.toFixed(2)} Br</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-500">Скидка {formData.discount || 0}%</div>
                    <div className="text-xl font-bold text-red-500">
                      -{(totalCost * (parseFloat(formData.discount) || 0) / 100).toFixed(2)} Br
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-200 bg-blue-50">
                    <div className="text-sm text-blue-600">Итого к оплате</div>
                    <div className="text-2xl font-bold text-blue-700">{finalCost.toFixed(2)} Br</div>
                  </div>
                </div>
                
                <div className="mt-4 bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Предоплата</div>
                    <div className="text-lg font-medium">
                      {formData.prepayment ? `${formData.prepayment} Br` : "—"}
                    </div>
                  </div>
                  {formData.prepayment && (
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-sm text-gray-500">Остаток</div>
                      <div className="text-lg font-medium">
                        {(finalCost - (parseFloat(formData.prepayment) || 0)).toFixed(2)} Br
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddEvent;