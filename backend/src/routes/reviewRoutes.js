// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Private routes for modifying a specific review
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;