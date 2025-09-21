const express = require("express");

const {
  getViewById,
  getAllViews,
  addView,
  deleteView,
  updateView,
  getViewsFromMonopoly,
  getViewsFromJungle,
  getViewsFromBunker,
} = require("../controllers/viewsControllers.js");
const requireAuth = require("../requireAuth");

function funFunction() {
  console.log(")");
}

const router = express.Router();

// Новые маршруты для получения просмотров по локациям
router.get("/monopoly", requireAuth, getViewsFromMonopoly);

router.get("/jungle", requireAuth, getViewsFromJungle);

router.get("/bunker", requireAuth, getViewsFromBunker);

router.post("/date", requireAuth, funFunction);

router.get("/:id", requireAuth, getViewById);

router.get("/", requireAuth, getAllViews);

router.post("/", requireAuth, addView);

router.delete("/:id", requireAuth, deleteView);

router.patch("/:id", requireAuth, updateView);

module.exports = router;
