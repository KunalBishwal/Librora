// src/controllers/bookController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

// =======================================================
// @desc    Get all books with pagination + search + avg rating
// @route   GET /api/books?page=1&search=keyword
// @access  Public
// =======================================================
const getBooks = async (req, res) => {
  const pageSize = 5;
  const page = Number(req.query.page) || 1;
  const search = req.query.search ? req.query.search.trim() : '';

  try {
    // Build search filter
    let filter = {};
    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive search
      filter = {
        $or: [
          { title: regex },
          { author: regex },
          { genre: regex }
        ],
      };
    }

    const count = await Book.countDocuments(filter);

    // Fetch paginated books
    const books = await Book.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .lean();

    // Aggregate reviews to compute average rating and review count
    const bookIds = books.map((b) => b._id);
    const agg = await Review.aggregate([
      { $match: { book: { $in: bookIds } } },
      {
        $group: {
          _id: '$book',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation array to map for quick lookup
    const aggMap = {};
    agg.forEach((a) => {
      aggMap[a._id.toString()] = {
        averageRating: a.averageRating || 0,
        reviewCount: a.reviewCount || 0,
      };
    });

    // Merge metadata with books
    const booksWithMeta = books.map((b) => {
      const meta = aggMap[b._id.toString()] || {
        averageRating: 0,
        reviewCount: 0,
      };
      return {
        ...b,
        averageRating: Number(meta.averageRating.toFixed(2)),
        reviewCount: meta.reviewCount,
      };
    });

    res.json({
      books: booksWithMeta,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('❌ Error in getBooks:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// =======================================================
// @desc    Get single book with reviews and avg rating
// @route   GET /api/books/:id
// @access  Public
// =======================================================
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const reviews = await Review.find({ book: book._id })
      .populate('user', 'name')
      .lean();

    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    res.json({
      ...book,
      reviews,
      averageRating: Number(avgRating.toFixed(2)),
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('❌ Error in getBookById:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// =======================================================
// @desc    Add a new book
// @route   POST /api/books
// @access  Private
// =======================================================
const addBook = async (req, res) => {
  const { title, author, description, genre, year } = req.body;

  try {
    const book = new Book({
      title,
      author,
      description,
      genre,
      year,
      addedBy: req.user._id,
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('❌ Error in addBook:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// =======================================================
// @desc    Update a book (only creator can)
// @route   PUT /api/books/:id
// @access  Private
// =======================================================
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const { title, author, description, genre, year } = req.body;
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (description !== undefined) book.description = description;
    if (genre !== undefined) book.genre = genre;
    if (year !== undefined) book.year = year;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error('❌ Error in updateBook:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// =======================================================
// @desc    Delete a book and its reviews (only creator)
// @route   DELETE /api/books/:id
// @access  Private
// =======================================================
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await Review.deleteMany({ book: req.params.id });
    await book.deleteOne();

    res.json({ message: 'Book and associated reviews removed' });
  } catch (error) {
    console.error('❌ Error in deleteBook:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
};
