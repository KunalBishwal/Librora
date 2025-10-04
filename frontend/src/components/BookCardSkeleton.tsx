import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BookCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </CardFooter>
    </Card>
  );
};
