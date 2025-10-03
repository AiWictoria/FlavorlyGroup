import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RatingStarsProps {
  recipeId: number;
  size?: string;
}

export default function StarsRating({
  recipeId,
  size = "fs-5",
}: RatingStarsProps) {
  const [average, setAverage] = useState<number>(0);

  useEffect(() => {
    async function fetchRatings() {
      try {
        const res = await fetch(`/api/ratings`);
        if (res.ok) {
          const data = await res.json();
          const recipeRatings = data.filter(
            (r: any) => r.recipeId === recipeId
          );
          if (recipeRatings.length > 0) {
            const avg =
              recipeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) /
              recipeRatings.length;
            setAverage(avg);
          } else {
            setAverage(0);
          }
        } else {
          toast.error("Could not load ratings");
          return { success: false };
        }
      } catch (error) {
        toast.error("Network error, please try again later");
        return { success: false };
      }
    }

    if (recipeId) fetchRatings();
  }, [recipeId]);

  const rounded = Math.round(average);

  return (
    <div className={`mx-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${
            star <= rounded ? "bi-star-fill text-warning" : "bi-star text-muted"
          } me-1`}
        />
      ))}
    </div>
  );
}
