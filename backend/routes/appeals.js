const express = require("express");
const router = express.Router();
const {
  getAppealsByUserId,
  addAppeal,
  updateAppeal,
  deleteAppeal,
  getAppealById,
} = require("../controllers/appealsControllers");
const requireAuth = require("../requireAuth");

router.get("/user/:id", requireAuth, getAppealsByUserId);
router.get("/:id", requireAuth, getAppealById)
router.post("/", requireAuth, addAppeal);
router.patch("/:id", requireAuth, updateAppeal);
router.delete("/:id", requireAuth, deleteAppeal);

module.exports = router;
