
import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react"

const SmartTimeInput = ({ value, onChange, label }) => {
  const [customValue, setCustomValue] = useState(value || '0');
  const [isCustom, setIsCustom] = useState(false);

  const commonOptions = ['0', '0.5', '1', '1.5', '2'];

  useEffect(() => {
    if (!commonOptions.includes(value) && value !== '0') {
      setIsCustom(true);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {!isCustom ? (
        <div className="flex flex-wrap gap-2">
          {commonOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setCustomValue(option);
              }}
              className={`px-3 py-1 text-sm rounded-md border ${
                value === option
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option === '0' ? 'Нет' : `${option} ч`}
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
            max="6"
            step="0.5"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="border text-center block w-8 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          />
          <span>часов</span>
          <button
            type="button"
            onClick={() => {
              onChange(customValue);
              if (commonOptions.includes(customValue)) {
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
              setCustomValue(value);
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

export default SmartTimeInput