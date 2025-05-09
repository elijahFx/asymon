const express = require("express");
const {
  addInGoing,
  updateInGoing,
  getAllInGoing,
  getSingleInGoing 
} = require("../controllers/in_corrControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addInGoing);
router.get("/", requireAuth, getAllInGoing);
router.get("/:id", requireAuth, getSingleInGoing); 
router.patch("/:id", requireAuth, updateInGoing); 

module.exports = router;