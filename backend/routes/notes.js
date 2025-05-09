const express = require("express");

const {
  addNote,
  getNotes,
  getNotesByCaseId,
  getSingleNote,
  editNote,
  deleteNote,
} = require("../controllers/notesControllers");
const requireAuth = require("../requireAuth");

const router = express.Router();

router.post("/", requireAuth, addNote);

router.get("/:id", requireAuth, getNotesByCaseId);

router.get("/", requireAuth, getNotes);

router.patch("/:id", requireAuth, editNote);

router.delete("/:id", requireAuth, deleteNote);

module.exports = router;
