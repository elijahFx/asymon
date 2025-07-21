import React, { useState } from "react";
import { Mail, User, Users, Phone, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setMessageText } from "../../slices/smsSlice";

export default function SMSPage() {
  const [mode, setMode] = useState("all");
  const [smsText, setSmsText] = useState("");
  const [singleNumber, setSingleNumber] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [multipleNumbers, setMultipleNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();

  const addNumber = () => {
    const num = numberInput.trim();
    if (!num) return;
    if (!/^\+?\d{7,15}$/.test(num)) {
      setErrorMessage("Неверный формат номера");
      return;
    }
    if (multipleNumbers.includes(num)) return;
    setMultipleNumbers((prev) => [...prev, num]);
    setNumberInput("");
    setErrorMessage("");
  };

  const removeNumber = (num) => {
    setMultipleNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleSend = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!smsText.trim()) {
      setErrorMessage("Введите текст сообщения");
      return;
    }

    let recipients = [];

    if (mode === "all") {
      recipients = ["ALL_CONTACTS"];
    } else if (mode === "single") {
      if (!singleNumber.trim()) {
        setErrorMessage("Введите номер");
        return;
      }
      recipients = [singleNumber.trim()];
    } else if (mode === "multiple") {
      if (multipleNumbers.length === 0) {
        setErrorMessage("Добавьте хотя бы один номер");
        return;
      }
      recipients = multipleNumbers;
    }

    setIsLoading(true);
    try {
      console.log("SMS отправлено:", recipients, smsText);
      await new Promise((res) => setTimeout(res, 1000));
      setSuccessMessage(
        `Сообщение отправлено ${recipients.length} получателям`
      );
    } catch {
      setErrorMessage("Ошибка отправки");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = (e) => {
    const value = e.target.value;
    setSmsText(value); // Обновляем локальное состояние
    dispatch(setMessageText(value)); // Обновляем Redux store
  };

  return (
    <div className="w-[50%]">
      <h1 className="text-2xl font-bold flex items-center">
        <Mail className="mr-2" /> Отправка SMS
      </h1>

      {/* Выбор режима */}
      <div>
        <p className="font-medium mb-2">Выберите получателей:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("all")}
            className={`px-4 py-2 rounded border ${
              mode === "all" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Всем
          </button>
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-2 rounded border ${
              mode === "single" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Один номер
          </button>
          <button
            onClick={() => setMode("multiple")}
            className={`px-4 py-2 rounded border ${
              mode === "multiple" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Несколько номеров
          </button>
        </div>
      </div>

      {/* Ввод одного номера */}
      {mode === "single" && (
        <input
          type="tel"
          value={singleNumber}
          onChange={(e) => setSingleNumber(e.target.value)}
          placeholder="+375291234567"
          className="w-full p-2 border rounded mt-2"
        />
      )}

      {/* Ввод нескольких номеров */}
      {mode === "multiple" && (
        <div className="space-y-2 mt-2">
          <div className="flex gap-2">
            <input
              type="tel"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNumber()}
              placeholder="+375291234567"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {multipleNumbers.map((num) => (
              <span
                key={num}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <Phone size={14} className="mr-1" />
                {num}
                <button
                  onClick={() => removeNumber(num)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ввод текста сообщения */}
      <div className="mt-2">
        <textarea
          value={smsText}
          onChange={handleMessage}
          rows={4}
          placeholder="Введите текст SMS..."
          className="w-full p-2 border rounded resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Максимум 160 символов. Сейчас: {smsText.length}
        </p>
      </div>

      {/* Сообщения и кнопка */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-green-600">{successMessage}</p>}
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </div>
  );
}