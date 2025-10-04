// src/controllers/userController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get books added by the logged-in user
// @route   GET /api/users/my-books
// @access  Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user._id });
    
    // Optionally, add average ratings to each book as well
    const booksWithRatings = await Promise.all(
      books.map(async (book) => {
        const reviews = await Review.find({ book: book._id });
        const reviewCount = reviews.length;
        const averageRating =
          reviewCount > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviewCount
            : 0;
        return {
          ...book.toObject(),
          averageRating,
          reviewCount,
        };
      })
    );

    res.json(booksWithRatings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reviews written by the logged-in user
// @route   GET /api/users/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate('book', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMyBooks, getMyReviews };