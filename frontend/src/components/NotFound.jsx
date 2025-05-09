import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6"
    >
      <div className="max-w-md w-full text-center">
        {/* Анимированное число 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-9xl font-bold text-[#0C1B60] mb-6"
        >
          404
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Ой! Страница не найдена
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Ошибка 404: Такого адреса на сайте не существует
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="cursor-pointer px-6 py-3 bg-[#0C1B60] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
        >
          Вернуться на главную
        </motion.button>
        
        {/* Декоративные элементы */}
        <div className="mt-12 flex justify-center space-x-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-[#0C1B60] rounded-full opacity-70"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}