// Константы для тарифов
const ADULT_TARIFFS = {
  "Тариф 1": { 
    base: 380, 
    additional: 25,
    includedPeople: 10 
  },
  "Тариф 2": { 
    base: 530, 
    additional: 30,
    includedPeople: 10 
  },
  "Тариф 3": { 
    base: 850, 
    additional: 40,
    includedPeople: 10 
  }
};

const CHILDREN_TARIFFS = {
  "Старт": { 
    base: 400, 
    additional: 25,
    includedChildren: 10,
    includedAdults: 3 
  },
  "Стандарт": { 
    base: 580, 
    additional: 30,
    includedChildren: 10,
    includedAdults: 5 
  },
  "ВИП": { 
    base: 760, 
    additional: 40,
    includedChildren: 10,
    includedAdults: 7 
  }
};

const SERVICE_RATES = {
  rental: 120,   // аренда за час
  host: 70       // ведущий за час
};

// Новые константы для дополнительных услуг
const ADDITIONAL_SERVICES = {
  labubu: {
    rate: 150,    // 150 рублей за каждые 15 минут
    interval: 15  // интервал в минутах
  },
  silver: {
    rate: 100,    // 100 рублей за каждые 30 минут
    interval: 30  // интервал в минутах
  }
};

/**
 * Расчет стоимости мероприятия
 * @param {Object} eventData - Данные мероприятия
 * @returns {Object} Результаты расчета
 */
export const calculateEventCost = (eventData) => {
  let baseCost = 0;
  let additionalCost = 0;
  
  // Расчет основной стоимости
  if (!eventData.isAmeteur) {
    // Взрослое мероприятие
    const tariff = ADULT_TARIFFS[eventData.peopleTariff] || {};
    const peopleCount = parseInt(eventData.peopleAmount) || 0;
    
    baseCost = tariff.base || 0;
    additionalCost = Math.max(0, peopleCount - tariff.includedPeople) * (tariff.additional || 0);
  } else {
    // Детское мероприятие
    const tariff = CHILDREN_TARIFFS[eventData.peopleTariff] || {};
    const childrenCount = parseInt(eventData.childrenAmount) || 0;
    const adultsCount = parseInt(eventData.adultsWithChildrenAmount) || 0;
    
    baseCost = tariff.base || 0;
    
    // Проверяем, превышает ли количество детей и взрослых включенные значения
    const additionalChildren = Math.max(0, childrenCount - tariff.includedChildren);
    const additionalAdults = Math.max(0, adultsCount - tariff.includedAdults);
    
    // Берем максимальное значение из превышений (доплата только за одного человека - ребенка или взрослого)
    additionalCost = Math.max(additionalChildren, additionalAdults) * (tariff.additional || 0);
  }

  // Расчет дополнительных услуг
  const additionalTime = parseFloat(eventData.additionalTime) || 0;
  const additionalTimeWithHost = parseFloat(eventData.additionalTimeWithHost) || 0;
  
  const additionalServicesCost = 
    (additionalTime * SERVICE_RATES.rental) + 
    (additionalTimeWithHost * SERVICE_RATES.host);

  // Расчет стоимости дополнительных услуг с Лабубу и Серебряной дискотекой
  const additionalTimeWithLabubu = parseInt(eventData.additionalTimeWithLabubu) || 0; // время в минутах
  const silverTime = parseInt(eventData.silverTime) || 0; // время в минутах
  
  // Расчет стоимости за Лабубу (150 руб за каждые 15 минут)
  const labubuCost = Math.ceil(additionalTimeWithLabubu / ADDITIONAL_SERVICES.labubu.interval) * ADDITIONAL_SERVICES.labubu.rate;
  
  // Расчет стоимости за Серебряную дискотеку (100 руб за каждые 30 минут)
  const silverCost = Math.ceil(silverTime / ADDITIONAL_SERVICES.silver.interval) * ADDITIONAL_SERVICES.silver.rate;

  const totalAdditionalServicesCost = additionalServicesCost + labubuCost + silverCost;

  // Итоговые расчеты
  const totalCost = baseCost + additionalCost + totalAdditionalServicesCost;
  const discountAmount = totalCost * (parseFloat(eventData.discount || 0) / 100);
  const finalCost = totalCost - discountAmount;
  const prepaymentAmount = parseFloat(eventData.prepayment || 0);
  const remainingAmount = finalCost - prepaymentAmount;

  return {
    totalCost,
    discountAmount,
    finalCost,
    prepaymentAmount,
    remainingAmount,
    baseCost,
    additionalCost,
    additionalServicesCost: totalAdditionalServicesCost,
    labubuCost,
    silverCost,
    details: {
      labubu: {
        time: additionalTimeWithLabubu,
        cost: labubuCost
      },
      silver: {
        time: silverTime,
        cost: silverCost
      }
    }
  };
};

/**
 * Получение информации о тарифах
 * @returns {Object} Объект с тарифам
 */
export const getTariffsInfo = () => ({
  adultTariffs: ADULT_TARIFFS,
  childrenTariffs: CHILDREN_TARIFFS,
  serviceRates: SERVICE_RATES,
  additionalServices: ADDITIONAL_SERVICES
});

/**
 * Вспомогательная функция для форматирования времени из минут
 * @param {number} minutes - Количество минут
 * @returns {string} Отформатированное время
 */
export const formatMinutesForDisplay = (minutes) => {
  if (!minutes || minutes === 0) return '0 мин';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes} мин`;
  if (remainingMinutes === 0) return `${hours} ч`;
  return `${hours} ч ${remainingMinutes} мин`;
};

/**
 * Вспомогательная функция для расчета стоимости конкретной услуги
 * @param {number} minutes - Количество минут
 * @param {string} serviceType - Тип услуги ('labubu' или 'silver')
 * @returns {number} Стоимость услуги
 */
export const calculateServiceCost = (minutes, serviceType) => {
  if (!minutes || minutes === 0) return 0;
  
  const service = ADDITIONAL_SERVICES[serviceType];
  if (!service) return 0;
  
  const intervals = Math.ceil(minutes / service.interval);
  return intervals * service.rate;
};