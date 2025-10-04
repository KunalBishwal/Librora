import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BookCard from '@/components/BookCard';
import { BookCardSkeleton } from '@/components/BookCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  genre?: string;
  year?: number;
  averageRating?: number;
  reviewCount?: number;
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const controllerRef = useRef<AbortController | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Cancel previous request to avoid flicker
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        if (debouncedSearchQuery) setSearching(true);
        else setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/books?page=${page}&search=${encodeURIComponent(debouncedSearchQuery)}`,
          { signal: controllerRef.current.signal }
        );

        const data = res.data || {};
        const rawBooks = data.books || [];

        const normalized = rawBooks.map((b: any) => ({
          _id: b._id ?? b.id,
          id: b.id ?? b._id,
          title: b.title,
          author: b.author,
          genre: b.genre,
          year: b.year,
          averageRating: Number(b.averageRating ?? b.avgRating ?? b.avg_rating ?? 0),
          reviewCount: Number(b.reviewCount ?? b.reviewsCount ?? b.review_count ?? (b.reviews ? b.reviews.length : 0)),
        }));

        setBooks(normalized);

        // ✅ Fixed TypeScript-safe version
        setTotalPages(
          (data.pages ?? data.totalPages ?? Math.ceil((data.total ?? 0) / 5)) || 1
        );
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error(err);
          toast.error('Failed to fetch books');
        }
      } finally {
        setLoading(false);
        setSearching(false);
      }
    };

    fetchBooks();
  }, [debouncedSearchQuery, page]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const showSkeleton = loading || searching;

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Discover & Review Your Favorite Books
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore thousands of books, share your thoughts, and discover your next great read
            </p>
          </motion.div>

          {/* Search Input + Clear Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto flex gap-2 relative"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search books by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg pl-12 pr-12 transition-all duration-300"
              />

              {/* Clear Search (X) button */}

              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    key="clear"
                    onClick={handleClearSearch}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ rotate: 90, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}

                    className="
        absolute right-4 top-1/2
        -translate-y-1/2
        flex items-center justify-center
        text-muted-foreground hover:text-primary
        focus:outline-none
      "
                    aria-label="Clear search"
                  >
                    <X className="h-[18px] w-[18px] stroke-[2.25] mt-[1px]" />
                  </motion.button>
                )}
              </AnimatePresence>


            </div>
          </motion.div>

          {/* Searching Status */}
          <AnimatePresence>
            {searching && (
              <motion.p
                key="searching-text"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-3 text-sm text-muted-foreground animate-pulse"
              >
                Searching for “{searchQuery}”...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Books Grid */}
      <section className="container mx-auto px-4 py-12">
        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {books.map((book) => (
                <motion.div key={book._id ?? book.id} variants={item}>
                  <BookCard {...book} />
                </motion.div>
              ))}
            </motion.div>

            {books.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No books found.</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searching && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default BookList;
