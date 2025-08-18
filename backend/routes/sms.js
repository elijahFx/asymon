const express = require("express");

const {
  sendSMS,
  getSMSStatus,
  getBalance,
  getSenders,
  addSender,
  getTemplates,
  sendBulkSMS
} = require("../controllers/smsControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/balance", requireAuth, getBalance);

router.post("/sendone", requireAuth, sendSMS)

router.post("/sendmultiple", requireAuth, sendBulkSMS)

module.exports = router;
