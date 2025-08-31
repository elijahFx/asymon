const express = require("express");

const {
  login,
  signup,
  editUser,
  getAllUsers,
  editUserLikeAdmin,
  deleteSingleUser,
} = require("../controllers/usersControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.get("/", requireAuth, getAllUsers);

router.post("/login", login);

router.post("/signup", signup);

router.patch("/adm", requireAuth, editUserLikeAdmin);

router.put("/", requireAuth, editUser);

router.delete("/", requireAuth, deleteSingleUser);

router.put("/avatar", requireAuth, editUser);

module.exports = router;
