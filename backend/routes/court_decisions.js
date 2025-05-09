const express = require("express");
const router = express.Router();
const {
  getCourtDecisions,
  addCourtDecision,
  updateCourtDecision,
  deleteCourtDecision,
} = require("../controllers/courtDecisionsControllers");
const requireAuth = require("../requireAuth");

router.get("/:id", requireAuth, getCourtDecisions);
router.post("/", requireAuth, addCourtDecision);
router.patch("/:id", requireAuth, updateCourtDecision);
router.delete("/:id", requireAuth, deleteCourtDecision);

module.exports = router;
