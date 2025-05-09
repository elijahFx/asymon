const express = require("express");

const {
  addCase,
  getCases,
  getCase,
  editCase,
  getShortCases,
} = require("../controllers/casesControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addCase);

router.get("/short", requireAuth, getShortCases);

router.get("/:id", requireAuth, getCase);

router.get("/", requireAuth, getCases);

router.put("/:id", requireAuth, editCase);

module.exports = router;
