const RocketSMS = require('node-rocketsms-api');

const smsClient = new RocketSMS({
  username: process.env.ROCKET_SMS_API_LOGIN,
  password: process.env.ROCKET_SMS_API_PASSWORD
});

// Отправка SMS
const sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message are required" });
    }

    const response = await smsClient.send(phone, message, true);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
};

// Проверка статуса SMS
const getSMSStatus = async (req, res) => {
  try {
    const { smsId } = req.params;
    
    if (!smsId) {
      return res.status(400).json({ error: "SMS ID is required" });
    }

    const status = await smsClient.status(smsId);
    res.status(200).json(status);
  } catch (error) {
    console.error("Error checking SMS status:", error);
    res.status(500).json({ error: "Failed to check SMS status" });
  }
};

// Получение баланса
const getBalance = async (req, res) => {
  try {
    const balance = await smsClient.balance();

    console.log(balance);
    
    res.status(200).json(balance);
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ error: "Failed to check balance" });
  }
};

// Получение списка альфа-имен
const getSenders = async (req, res) => {
  try {
    const senders = await smsClient.senders();
    res.status(200).json(senders);
  } catch (error) {
    console.error("Error fetching senders:", error);
    res.status(500).json({ error: "Failed to fetch senders" });
  }
};

// Добавление альфа-имени
const addSender = async (req, res) => {
  try {
    const { sender } = req.body;
    
    if (!sender) {
      return res.status(400).json({ error: "Sender is required" });
    }

    const response = await smsClient.addSender(sender);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding sender:", error);
    res.status(500).json({ error: "Failed to add sender" });
  }
};

// Получение списка шаблонов
const getTemplates = async (req, res) => {
  try {
    const templates = await smsClient.templates();
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

const sendBulkSMS = async (req, res) => {
  try {
    const { phones, message } = req.body;
    
    // Валидация входных данных
    if (!phones || !Array.isArray(phones) || phones.length < 2) {
      return res.status(400).json({ 
        error: "Phones must be an array with at least 2 numbers" 
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        error: "Message is required and must be a non-empty string" 
      });
    }

    // Лимит на количество номеров (можно настроить)
    const MAX_PHONES = 100;
    if (phones.length > MAX_PHONES) {
      return res.status(400).json({
        error: `Too many phone numbers. Maximum allowed is ${MAX_PHONES}`
      });
    }

    // Проверка формата номеров
    const invalidPhones = phones.filter(phone => !/^\+?\d{7,15}$/.test(phone));
    if (invalidPhones.length > 0) {
      return res.status(400).json({
        error: "Invalid phone numbers detected",
        invalidNumbers: invalidPhones
      });
    }

    // Отправка сообщений (можно использовать Promise.all для параллельной отправки)
    const results = [];
    const errors = [];
    
    for (const phone of phones) {
      try {
        const response = await smsClient.send(phone, message, true);
        results.push({
          phone,
          status: 'success',
          response
        });
      } catch (error) {
        errors.push({
          phone,
          status: 'error',
          error: error.message
        });
      }
    }

    // Формирование итогового ответа
    const successCount = results.length;
    const errorCount = errors.length;
    
    res.status(200).json({
      success: true,
      message: `Sent ${successCount} messages, ${errorCount} failed`,
      total: phones.length,
      successCount,
      errorCount,
      results,
      errors: errorCount > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Error in bulk SMS sending:", error);
    res.status(500).json({ 
      error: "Failed to send bulk SMS",
      details: error.message 
    });
  }
};

module.exports = {
  sendSMS,
  getSMSStatus,
  getBalance,
  getSenders,
  addSender,
  getTemplates,
  sendBulkSMS
};