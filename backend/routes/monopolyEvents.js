const express = require("express");

const {
  getAllEvents,
  addEvent,
  deleteEvent,
  updateEvent,
  getEventById,
  getEventsFromAll
} = require("../controllers/monopolyEventsControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/all", requireAuth, getEventsFromAll)

router.get("/:id", requireAuth, getEventById);

router.get("/", requireAuth, getAllEvents);

router.post("/", requireAuth, addEvent);

router.delete("/:id", requireAuth, deleteEvent);

router.patch("/:id", requireAuth, updateEvent);

module.exports = router;
