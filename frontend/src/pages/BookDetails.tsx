import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre?: string;
  year?: number;
  averageRating: number;
  reviews: Review[];
  reviewCount?: number;
}

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // useAuth type is unknown; cast to any to avoid TS mismatch
  const auth = useAuth() as any;
  const user = auth?.user;
  const isAuthenticated = Boolean(auth?.isAuthenticated);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [editingReview, setEditingReview] = useState<string | null>(null);

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books/${id}`);
      const raw = response.data || {};

      // normalize the returned book object
      const normalized: Book = {
        _id: raw._id ?? raw.id,
        title: raw.title ?? '',
        author: raw.author ?? '',
        description: raw.description ?? '',
        genre: raw.genre,
        year: raw.year,
        averageRating: Number(raw.averageRating ?? raw.avgRating ?? raw.avg_rating ?? 0),
        reviews: Array.isArray(raw.reviews) ? raw.reviews : (raw.reviews || []),
        reviewCount: Number(raw.reviewCount ?? raw.reviewsCount ?? (raw.reviews ? raw.reviews.length : 0)),
      };

      setBook(normalized);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      if (editingReview) {
        await axios.put(
          `${API_BASE_URL}/reviews/${editingReview}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Review updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/books/${id}/reviews`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Review added successfully');
      }

      setComment('');
      setRating(5);
      setEditingReview(null);
      await fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Not authorized');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted successfully');
      await fetchBook();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const startEditReview = (review: Review) => {
    setEditingReview(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  // helper to get current user's id in a safe way (backend/frontend may use different keys)
  const currentUserId = (user as any)?._id ?? (user as any)?.id ?? (user as any)?.userId ?? null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Book not found</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-4 py-8">
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left: Book Details */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-3xl">{book.title}</CardTitle>
              <p className="text-lg text-muted-foreground">by {book.author}</p>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-xl font-semibold">{Number(book.averageRating ?? 0).toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({book.reviews?.length ?? book.reviewCount ?? 0} {(book.reviews?.length ?? book.reviewCount ?? 0) === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                {book.year && <Badge variant="outline">{book.year}</Badge>}
              </div>
            </CardHeader>

            <CardContent>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Reviews */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="md:col-span-3">
          {/* Add Review Form */}
          {isAuthenticated && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{editingReview ? 'Edit Your Review' : 'Write a Review'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Rating</label>
                      <StarRating rating={rating} onRatingChange={setRating} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <Textarea placeholder="Share your thoughts about this book..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">{editingReview ? 'Update Review' : 'Submit Review'}</Button>
                      {editingReview && (
                        <Button type="button" variant="outline" onClick={() => { setEditingReview(null); setComment(''); setRating(5); }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>

            <AnimatePresence mode="popLayout">
              {(!book.reviews || book.reviews.length === 0) ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review!
                </motion.p>
              ) : (
                book.reviews.map((review, index) => (
                  <motion.div key={review._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: index * 0.05 }}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{review.user.name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>

                          {currentUserId && currentUserId === review.user._id && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => startEditReview(review)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(review._id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          )}
                        </div>

                        <StarRating rating={review.rating} readonly size="sm" />

                        <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookDetails;
