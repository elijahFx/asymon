const express = require("express");

const {
  getWaitingById,
  getAllWaitings,
  addWaiting,
  deleteWaiting,
  updateWaiting,
} = require("../controllers/waitingsControllers.js");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/:id", requireAuth, getWaitingById);

router.get("/", requireAuth, getAllWaitings);

router.post("/", requireAuth, addWaiting);

router.delete("/:id", requireAuth, deleteWaiting);

router.patch("/:id", requireAuth, updateWaiting);

module.exports = router;
