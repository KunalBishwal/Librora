// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMyBooks, getMyReviews } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');


router.get('/my-books', protect, getMyBooks);


router.get('/my-reviews', protect, getMyReviews);

module.exports = router;