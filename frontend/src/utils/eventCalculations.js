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

  // Итоговые расчеты
  const totalCost = baseCost + additionalCost + additionalServicesCost;
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
    additionalServicesCost
  };
};

/**
 * Получение информации о тарифах
 * @returns {Object} Объект с тарифами
 */
export const getTariffsInfo = () => ({
  adultTariffs: ADULT_TARIFFS,
  childrenTariffs: CHILDREN_TARIFFS,
  serviceRates: SERVICE_RATES
});