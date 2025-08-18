import React, { useState } from "react";
import { Mail, Phone, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setMessageText } from "../../slices/smsSlice";
import {
  useGetBalanceQuery,
  useSendSMSMutation,
  useSendSMSBulkMutation,
} from "../../apis/smsApi";
import UserBalance from "./UserBalance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SMSPage() {
  const [mode, setMode] = useState("all");
  const [smsText, setSmsText] = useState("");
  const [singleNumber, setSingleNumber] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [multipleNumbers, setMultipleNumbers] = useState([]);

  const [sendSMS, { isLoading: isSingleSending }] = useSendSMSMutation();
  const [sendSMSBulk, { isLoading: isBulkSending }] = useSendSMSBulkMutation();
  const { data: balanceData } = useGetBalanceQuery();

  const isSending = isSingleSending || isBulkSending;
  const dispatch = useDispatch();

  const addNumber = () => {
    const num = numberInput.trim();
    if (!num) {
      toast.error("Введите номер телефона");
      return;
    }
    if (!/^\+?\d{7,15}$/.test(num)) {
      toast.error("Неверный формат номера");
      return;
    }
    if (multipleNumbers.includes(num)) {
      toast.warning("Этот номер уже добавлен");
      return;
    }
    setMultipleNumbers((prev) => [...prev, num]);
    setNumberInput("");
    toast.success("Номер добавлен");
  };

  const removeNumber = (num) => {
    setMultipleNumbers((prev) => prev.filter((n) => n !== num));
    toast.info("Номер удален");
  };

  const handleSend = async () => {
    if (balanceData?.credits <= 0) {
      toast.error("Недостаточно средств на балансе");
      return;
    }

    if (!smsText.trim()) {
      toast.error("Введите текст сообщения");
      return;
    }

    let recipients = [];

    if (mode === "all") {
      recipients = ["ALL_CONTACTS"];
    } else if (mode === "single") {
      if (!singleNumber.trim()) {
        toast.error("Введите номер телефона");
        return;
      }
      recipients = [singleNumber.trim()];
    } else if (mode === "multiple") {
      if (multipleNumbers.length === 0) {
        toast.error("Добавьте хотя бы один номер");
        return;
      }
      recipients = multipleNumbers;
    }

    try {
      let result;

      if (mode === "multiple" && recipients.length > 1) {
        // Bulk отправка
        result = await sendSMSBulk({
          phones: recipients,
          message: smsText,
        }).unwrap();

        toast.success(`Сообщения отправлены на ${recipients.length} номеров`, {
          autoClose: 3000,
        });
      } else {
        // Одиночная отправка
        const results = await Promise.all(
          recipients.map((phone) =>
            sendSMS({
              phone,
              message: smsText,
            }).unwrap()
          )
        );

        const successfulSends = results.filter((r) => r.status === "success");
        log

        if (successfulSends.length === recipients.length) {
          toast.success(
            `Все сообщения успешно отправлены (${recipients.length})`,
            { autoClose: 2500 }
          );
        } else {
          toast.warning(
            `Отправлено`,
            { autoClose: 3000 }
          );
        }
      }
    } catch (error) {
      console.error("Ошибка отправки SMS:", error);
      toast.error(
        error.data?.message || error.message || "Ошибка при отправке SMS",
        { autoClose: 4000 }
      );
    }
  };

  const handleMessage = (e) => {
    const value = e.target.value;
    setSmsText(value);
    dispatch(setMessageText(value));
  };

  return (
    <div className="w-[50%] relative">
      <h1 className="text-2xl font-bold flex items-center">
        <Mail className="mr-2" /> Отправка SMS
      </h1>

      <UserBalance />

      <div className="mt-4">
        <p className="font-medium mb-2">Выберите получателей:</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("all");
              toast.info("Режим отправки: Всем контактам");
            }}
            className={`px-4 py-2 rounded border ${
              mode === "all" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Всем
          </button>
          <button
            onClick={() => {
              setMode("single");
              toast.info("Режим отправки: Один номер");
            }}
            className={`px-4 py-2 rounded border ${
              mode === "single" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Один номер
          </button>
          <button
            onClick={() => {
              setMode("multiple");
              toast.info("Режим отправки: Несколько номеров");
            }}
            className={`px-4 py-2 rounded border ${
              mode === "multiple" ? "bg-blue-500 text-white" : "border-gray-300"
            }`}
          >
            Несколько номеров
          </button>
        </div>
      </div>

      {mode === "single" && (
        <input
          type="tel"
          value={singleNumber}
          onChange={(e) => setSingleNumber(e.target.value)}
          placeholder="+375291234567"
          className="w-full p-2 border rounded mt-2"
        />
      )}

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

      <div className="mt-4">
        <textarea
          value={smsText}
          onChange={handleMessage}
          rows={4}
          placeholder="Введите текст SMS..."
          className="w-full p-2 border rounded resize-none"
          maxLength={160}
        />
        <p className="text-sm text-gray-500 mt-1">
          {smsText.length}/160 символов
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm space-y-1">
          {/* Оставлено для возможных дополнительных сообщений */}
        </div>
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Отправка...
            </>
          ) : (
            "Отправить"
          )}
        </button>
      </div>
    </div>
  );
}
