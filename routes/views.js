const express = require("express");

const {
  getViewById,
  getAllViews,
  addView,
  deleteView,
  updateView,
} = require("../controllers/viewsControllers.js");
const requireAuth = require("../requireAuth");

function funFunction() {
  console.log(")");
}

const router = express.Router();

router.post("/date", requireAuth, funFunction);

router.get("/:id", requireAuth, getViewById);

router.get("/", requireAuth, getAllViews);

router.post("/", requireAuth, addView);

router.delete("/:id", requireAuth, deleteView);

router.patch("/:id", requireAuth, updateView);

module.exports = router;
