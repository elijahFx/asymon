import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react"

const SmartTimeInput = ({ value, onChange, label }) => {
  const isMinutesMode = label === "labubu" || label === "silver";
  
  // Конвертируем начальное значение в зависимости от режима
  const getInitialDisplayValue = () => {
    if (isMinutesMode) {
      // Для минутного режима: value уже в минутах, отображаем как есть
      return value || '0';
    } else {
      // Для часового режима: value в часах, отображаем как есть
      return value || '0';
    }
  };

  const [displayValue, setDisplayValue] = useState(getInitialDisplayValue());
  const [isCustom, setIsCustom] = useState(false);

  // Определяем шаги в зависимости от label
  const getStepOptions = () => {
    if (label === "labubu") {
      // Шаги по 15 минут
      return ['0', '15', '30', '45', '60', '75', '90', '105', '120'];
    } else if (label === "silver") {
      // Шаги по 30 минут
      return ['0', '30', '60', '90', '120', '150', '180', '210', '240'];
    } else {
      // Стандартные шаги по 0.5 часа
      return ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '9', '9.5', '10', '10.5', '11'];
    }
  };

  const commonOptions = getStepOptions();

  useEffect(() => {
    if (!commonOptions.includes(value) && value !== '0' && value !== 0) {
      setIsCustom(true);
    }
  }, [value]);

  // Функция для обработки изменения значения
  const handleValueChange = (newDisplayValue) => {
    if (isMinutesMode) {
      // Для минутного режима: передаем минуты как есть
      onChange(newDisplayValue);
    } else {
      // Для часового режима: передаем часы как есть
      onChange(newDisplayValue);
    }
    setDisplayValue(newDisplayValue);
  };

  // Функция для форматирования отображения
  const formatDisplay = (val) => {
    if (isMinutesMode) {
      return val === '0' ? 'Нет' : `${val} мин`;
    } else {
      return val === '0' ? 'Нет' : `${val} ч`;
    }
  };

  // Определяем шаг для input
  const getInputStep = () => {
    if (label === "labubu") return "15"; // 15 минут
    if (label === "silver") return "30"; // 30 минут
    return "0.5"; // по умолчанию 0.5 часа
  };

  // Определяем максимальное значение
  const getMaxValue = () => {
    if (label === "labubu") return "1440"; // 24 часа в минутах
    if (label === "silver") return "1440"; // 24 часа в минутах
    return "6"; // по умолчанию 6 часов
  };

  // Определяем placeholder для input
  const getInputPlaceholder = () => {
    if (isMinutesMode) return "минут";
    return "часов";
  };

  return (
    <div className="space-y-2">
      {!isCustom ? (
        <div className="flex flex-wrap gap-2">
          {commonOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleValueChange(option)}
              className={`px-3 py-1 text-sm rounded-md border ${
                value === option
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {formatDisplay(option)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Plus size={14} className="mr-1" /> Другое
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max={getMaxValue()}
            step={getInputStep()}
            value={displayValue}
            onChange={(e) => setDisplayValue(e.target.value)}
            className="border text-center block w-20 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          />
          <span>{getInputPlaceholder()}</span>
          <button
            type="button"
            onClick={() => {
              handleValueChange(displayValue);
              if (commonOptions.includes(displayValue)) {
                setIsCustom(false);
              }
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Check size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setDisplayValue(value || '0');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartTimeInput;