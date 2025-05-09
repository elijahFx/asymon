const express = require("express");

const {
  login,
  signup,
  editUser
} = require("../controllers/usersControllers");
const { getUsersStatistics } = require("../calcs/userStatistics");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/:id/statistics", requireAuth, getUsersStatistics)

router.post("/login", login);

router.post("/signup", requireAuth, signup);

router.put("/", requireAuth, editUser)

router.put("/avatar", requireAuth, editUser)


module.exports = router;
