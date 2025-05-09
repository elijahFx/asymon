const express = require("express");

const {
  addCourtVisit,
  getCourtVisitsByCaseId,
  deleteCourtVisit,
} = require("../controllers/courtVisitsControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addCourtVisit);

router.get("/:id", requireAuth, getCourtVisitsByCaseId);

router.delete("/:id", requireAuth, deleteCourtVisit);

module.exports = router;
