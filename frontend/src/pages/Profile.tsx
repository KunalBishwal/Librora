import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Star, BookOpen, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre?: string;
  year?: number;
  averageRating: number;
  reviewCount: number;
}

interface Review {
  _id: string;
  book: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [booksRes, reviewsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/my-books`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/users/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMyBooks(booksRes.data);
      setMyReviews(reviewsRes.data);
    } catch (error) {
      toast.error('Failed to fetch your data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book deleted successfully');
      fetchUserData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="shadow-[var(--shadow-book)]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="books" className="gap-2">
                <BookOpen className="h-4 w-4" />
                My Books ({myBooks.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                My Reviews ({myReviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="books">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {myBooks.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">You haven't added any books yet.</p>
                        <Link to="/add-book">
                          <Button className="mt-4">Add Your First Book</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    myBooks.map((book, index) => (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-[var(--shadow-hover)] transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{book.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({book.reviewCount} reviews)
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mb-4">
                              {book.genre && <Badge variant="secondary" className="text-xs">{book.genre}</Badge>}
                              {book.year && <Badge variant="outline" className="text-xs">{book.year}</Badge>}
                            </div>

                            <div className="flex gap-2">
                              <Link to={`/edit-book/${book._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBook(book._id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="reviews">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {myReviews.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">You haven't written any reviews yet.</p>
                        <Link to="/">
                          <Button className="mt-4">Browse Books</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    myReviews.map((review, index) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-[var(--shadow-hover)] transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-3">
                              <Link to={`/books/${review.book._id}`} className="hover:underline">
                                <h3 className="font-semibold text-lg">{review.book.title}</h3>
                              </Link>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-medium">{review.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground mb-2">{review.comment}</p>
                            
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
