const express = require('express');
const router = express.Router();
const {
    getAllComplaints,
    getComplaintById,
    createComplaint,
    deleteComplaint,
    patchComplaintStatus
} = require("../controllers/claimsControllers");
const requireAuth = require('../requireAuth');

router.get('/', requireAuth, getAllComplaints);
router.get('/:id', requireAuth, getComplaintById);
router.post('/', createComplaint);
router.delete('/:id', requireAuth, deleteComplaint);
router.patch('/:id', requireAuth, patchComplaintStatus);

module.exports = router;