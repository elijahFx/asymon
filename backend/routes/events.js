const express = require("express");

const {
  addEvent,
  editEvent,
  getEvents,
  getSingleEvent,
  getEventsByDate,
} = require("../controllers/eventsControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addEvent);

router.get("/dates", requireAuth, getEventsByDate); // <-- поправил здесь

router.get("/:id", requireAuth, getSingleEvent);

router.get("/", requireAuth, getEvents);

router.put("/:id", requireAuth, editEvent);

module.exports = router;
