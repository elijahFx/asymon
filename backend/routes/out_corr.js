const express = require("express");
const {
  addOutGoing,
  updateOutGoing,
  getAllOutGoing,
  getSingleOutGoing
} = require("../controllers/out_corrControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addOutGoing);
router.get("/", requireAuth, getAllOutGoing);
router.get("/:id", requireAuth, getSingleOutGoing);
router.patch("/:id", requireAuth, updateOutGoing);

module.exports = router;