import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface BookCardProps {
 
  _id?: string;
  id?: string;
  title: string;
  author: string;
  genre?: string;
  year?: number;
  averageRating?: number;
  reviewCount?: number;
}

const BookCard = ({
  _id,
  id,
  title,
  author,
  genre,
  year,
  averageRating = 0,
  reviewCount = 0,
}: BookCardProps) => {
  const bookId = _id ?? id ?? '';

  return (
    <Link to={`/books/${bookId}`}>
      <motion.div whileHover={{ scale: 1.01 }} className="h-full">
        <Card className="h-full">
          <CardContent>
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{author}</p>

            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium">{Number(averageRating ?? 0).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount ?? 0} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2 pt-0">
            {genre && <Badge variant="secondary" className="text-xs">{genre}</Badge>}
            {year && <Badge variant="outline" className="text-xs">{year}</Badge>}
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default BookCard;
