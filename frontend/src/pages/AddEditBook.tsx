import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api';

const AddEditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    year: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/${id}`);
      const book = response.data;
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre || '',
        year: book.year?.toString() || ''
      });
    } catch (error) {
      toast.error('Failed to fetch book details');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    const bookData = {
      ...formData,
      year: formData.year ? parseInt(formData.year) : undefined
    };

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/books/${id}`, bookData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Book updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/books`, bookData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Book added successfully');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-[var(--shadow-book)]">
            <CardHeader>
              <CardTitle className="text-2xl">
                {isEditMode ? 'Edit Book' : 'Add New Book'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter book description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      name="genre"
                      placeholder="e.g., Fiction, Mystery"
                      value={formData.genre}
                      onChange={handleChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="year">Publication Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      placeholder="e.g., 2024"
                      value={formData.year}
                      onChange={handleChange}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-4"
                >
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Book' : 'Add Book'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AddEditBook;
