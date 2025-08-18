import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const formatMessage = (text) => {
  if (!text) return null;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const SMSPreview = () => {
  const { text } = useSelector((state) => state.sms || "Даров");
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const phoneAnimation = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={phoneAnimation}
        className="relative bg-black rounded-[36px] p-2 h-[min(76.5vh,700px)] w-[min(255px,100%)] shadow-xl border-[6px] border-black"
      >
        {/* Верхняя панель iPhone */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex items-center z-10">
          <div className="h-5 w-5 rounded-full bg-gray-800 mr-1.5"></div>
          <div className="h-1.5 w-20 rounded-full bg-gray-800"></div>
        </div>

        {/* Экран сообщений */}
        <div className="bg-gray-100 rounded-[30px] h-full w-full overflow-hidden flex flex-col">
          {/* Шапка чата */}
          <div className="bg-gray-200 pl-2 pr-2 pt-5 border-b border-gray-300 flex justify-between items-center h-18">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full h-7 w-7 flex items-center justify-center text-white text-sm">
                M
              </div>
              <div className="ml-2">
                <h3 className="font-semibold text-sm">MONOPOLY.BY</h3>
                <p className="text-xs text-gray-500">SMS</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">{currentTime}</span>
          </div>

          {/* История сообщений */}
          <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
            {/* Сообщение от MONOPOLY.BY */}
            <div className="flex mb-2">
              <div className="max-w-[80%]">
                <div className="bg-white rounded-lg px-2.5 py-1.5 shadow text-sm break-words">
                  {formatMessage(text)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 ml-1">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          {/* Клавиатура (имитация) */}
          <div className="bg-gray-200 p-1.5 border-t border-gray-300">
            <div className="bg-white rounded-lg px-2.5 py-1 text-gray-400 text-xs">
              Написать сообщение...
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SMSPreview;