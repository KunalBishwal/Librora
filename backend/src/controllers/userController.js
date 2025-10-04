// src/controllers/userController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user._id });
    
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

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate('book', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMyBooks, getMyReviews };