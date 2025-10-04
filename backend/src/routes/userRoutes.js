// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMyBooks, getMyReviews } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/users/my-books
router.get('/my-books', protect, getMyBooks);

// @route   GET /api/users/my-reviews
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;