// Константы для тарифов
const ADULT_TARIFFS = {
  "Тариф 1": { 
    base: 380, 
    includedPeople: 13 
  },
  "Тариф 2": { 
    base: 530, 
    includedPeople: 13 
  },
  "Тариф 3": { 
    base: 850, 
    includedPeople: 13 
  }
};

const CHILDREN_TARIFFS = {
  "Старт": { 
    base: 400, 
    includedPeople: 13 
  },
  "Стандарт": { 
    base: 580, 
    includedPeople: 13 
  },
  "ВИП": { 
    base: 760, 
    includedPeople: 13 
  }
};

// Доплаты за превышение количества людей
const ADDITIONAL_PEOPLE_RATES = {
  rate1: 25,  // за каждого человека свыше 13 до 15
  rate2: 30,  // за каждого человека от 15 до 17
  rate3: 40   // за каждого человека после 17
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
  console.log(eventData);

  let baseCost = 0;
  let additionalCost = 0;
  
  // Получаем базовую стоимость в зависимости от типа мероприятия и тарифа
  if (!eventData.isAmeteur) {
    // Взрослое мероприятие
    const tariff = ADULT_TARIFFS[eventData.peopleTariff] || {};
    baseCost = tariff.base || 0;
  } else {
    // Детское мероприятие
    const tariff = CHILDREN_TARIFFS[eventData.peopleTariff] || {};
    baseCost = tariff.base || 0;
  }

  // Расчет доплаты за количество людей
  const peopleCount = parseInt(eventData.peopleAmount) || 0;
  
  if (peopleCount > 13) {
    const additionalPeople = peopleCount - 13;
    
    if (additionalPeople <= 2) { // 14-15 человек
      additionalCost = additionalPeople * ADDITIONAL_PEOPLE_RATES.rate1;
    } else if (additionalPeople <= 4) { // 16-17 человек
      additionalCost = 2 * ADDITIONAL_PEOPLE_RATES.rate1 + // за 14-15 человек
                      (additionalPeople - 2) * ADDITIONAL_PEOPLE_RATES.rate2;
    } else { // 18+ человек
      additionalCost = 2 * ADDITIONAL_PEOPLE_RATES.rate1 + // за 14-15 человек
                      2 * ADDITIONAL_PEOPLE_RATES.rate2 + // за 16-17 человек
                      (additionalPeople - 4) * ADDITIONAL_PEOPLE_RATES.rate3;
    }
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
      },
      people: {
        count: peopleCount,
        additional: additionalCost
      }
    }
  };
};

/**
 * Получение информации о тарифах
 * @returns {Object} Объект с тарифами
 */
export const getTariffsInfo = () => ({
  adultTariffs: ADULT_TARIFFS,
  childrenTariffs: CHILDREN_TARIFFS,
  additionalPeopleRates: ADDITIONAL_PEOPLE_RATES,
  serviceRates: SERVICE_RATES,
  additionalServices: ADDITIONAL_SERVICES
});

/**
 * Вспомогательная функция для расчета доплаты за людей
 * @param {number} peopleCount - Общее количество людей
 * @returns {number} Доплата
 */
export const calculateAdditionalPeopleCost = (peopleCount) => {
  if (peopleCount <= 13) return 0;
  
  const additionalPeople = peopleCount - 13;
  
  if (additionalPeople <= 2) { // 14-15 человек
    return additionalPeople * ADDITIONAL_PEOPLE_RATES.rate1;
  } else if (additionalPeople <= 4) { // 16-17 человек
    return 2 * ADDITIONAL_PEOPLE_RATES.rate1 + 
           (additionalPeople - 2) * ADDITIONAL_PEOPLE_RATES.rate2;
  } else { // 18+ человек
    return 2 * ADDITIONAL_PEOPLE_RATES.rate1 + 
           2 * ADDITIONAL_PEOPLE_RATES.rate2 + 
           (additionalPeople - 4) * ADDITIONAL_PEOPLE_RATES.rate3;
  }
};

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