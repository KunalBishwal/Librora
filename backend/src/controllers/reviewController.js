// // src/controllers/reviewController.js
// const Review = require('../models/Review');
// const Book = require('../models/Book');

// // @desc    Add a new review
// // @route   POST /api/books/:id/reviews
// // @access  Private
// const addReview = async (req, res) => {
//   const { rating, comment } = req.body;
//   const bookId = req.params.id;

//   try {
//     const book = await Book.findById(bookId);
//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     // Check if user already reviewed this book
//     const alreadyReviewed = await Review.findOne({
//       book: bookId,
//       user: req.user._id,
//     });

//     if (alreadyReviewed) {
//       return res.status(400).json({ message: 'Book already reviewed' });
//     }

//     const review = new Review({
//       rating: Number(rating),
//       comment,
//       user: req.user._id,
//       book: bookId,
//     });

//     await review.save();
//     res.status(201).json({ message: 'Review added' });
//   } catch (error) {
//     res.status(400).json({ message: 'Invalid review data' });
//   }
// };


// // @desc    Update a review
// // @route   PUT /api/reviews/:id
// // @access  Private (only reviewer)
// const updateReview = async (req, res) => {
//   const { rating, comment } = req.body;
  
//   try {
//     const review = await Review.findById(req.params.id);

//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }
    
//     // Check if the user is the creator of the review
//     if (review.user.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }

//     review.rating = rating || review.rating;
//     review.comment = comment || review.comment;

//     await review.save();
//     res.json({ message: 'Review updated' });
//   } catch (error) {
//     res.status(400).json({ message: 'Update failed' });
//   }
// };


// // @desc    Delete a review
// // @route   DELETE /api/reviews/:id
// // @access  Private (only reviewer)
// const deleteReview = async (req, res) => {
//   try {
//     const review = await Review.findById(req.params.id);

//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     if (review.user.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }
    
//     await review.deleteOne();
//     res.json({ message: 'Review removed' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error' });
//   }
// };


// module.exports = { addReview, updateReview, deleteReview };

// src/controllers/reviewController.js
const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc Add a review to a book
// @route POST /api/books/:id/reviews
// @access Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Prevent multiple reviews by same user for same book (optional)
    const existing = await Review.findOne({ book: bookId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this book' });

    const review = new Review({
      book: bookId,
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Update review (owner only)
// @route PUT /api/reviews/:id
// @access Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Delete review (owner only)
// @route DELETE /api/reviews/:id
// @access Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { addReview, updateReview, deleteReview };
