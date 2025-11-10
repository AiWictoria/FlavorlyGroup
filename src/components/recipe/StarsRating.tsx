import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useRatings } from "../../hooks/useRatings";

interface StarsRatingProps {
  recipeId: number;
  mode?: "view" | "rate";
  size?: string;
}

export default function StarsRating({
  recipeId,
  mode = "view",
  size = "fs-5",
}: StarsRatingProps) {
  const { user } = useAuth();
  const { fetchRatings, addRating } = useRatings();

  const [average, setAverage] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    async function loadRatings() {
      const result = await fetchRatings(recipeId);
      if (!result.success || !result.data) return;

      const data = result.data;

      if (data.length > 0) {
        const avg =
          data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
        setAverage(avg);
      } else {
        setAverage(0);
      }

      if (user) {
        const found = data.find((r: any) => r.userId === user.id);
        setUserRating(found?.rating ?? 0);
      }
    }

    if (recipeId) loadRatings();
  }, [recipeId, user]);

  async function handleRate(value: number) {
    if (mode !== "rate") return;
    if (!user) return;

    await addRating(recipeId, value);
    setUserRating(value);
  }

  const displayValue =
    mode === "rate" ? hovered ?? userRating : Math.round(average);

  return (
    <div className={`d-flex align-items-center ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${
            star <= displayValue
              ? "bi-star-fill text-warning"
              : "bi-star text-muted"
          } me-1`}
          role={mode === "rate" ? "button" : undefined}
          style={{ cursor: mode === "rate" ? "pointer" : "default" }}
          onMouseEnter={() => mode === "rate" && setHovered(star)}
          onMouseLeave={() => mode === "rate" && setHovered(null)}
          onClick={() => handleRate(star)}
        />
      ))}
    </div>
  );
}
