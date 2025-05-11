const express = require("express");

const {
  getAllEvents,
  addEvent,
  deleteEvent,
  updateEvent,
  getEventById,
} = require("../controllers/bunkerEventsControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/:id", requireAuth, getEventById);

router.get("/", requireAuth, getAllEvents);

router.post("/", requireAuth, addEvent);

router.delete("/:id", requireAuth, deleteEvent);

router.patch("/:id", requireAuth, updateEvent);

module.exports = router;
