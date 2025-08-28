export const validatePhoneNumber = (phone) => {
  // Формат: + и 12 цифр (например: +79001234567)
  const phoneRegex = /^\+\d{11,12}$/;
  return phoneRegex.test(phone);
};
