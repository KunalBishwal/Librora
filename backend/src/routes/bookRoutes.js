// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getBooks);
router.route('/:id').get(getBookById);

// Private routes (require authentication)
router.route('/').post(protect, addBook);
router.route('/:id').put(protect, updateBook).delete(protect, deleteBook);

// Route for adding a review to a book
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;