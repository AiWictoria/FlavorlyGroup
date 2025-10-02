import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  recipeId: number;
  title: string;
  category: string;
  imageUrl?: string;
  averageRating?: number;
  commentsCount?: number;
}

export default function RecipeCard({
  recipeId,
  title,
  category,
  imageUrl = "/images/recipes/placeholder.png",
  averageRating = 0,
  commentsCount = 0,
}: RecipeCardProps) {
  const roundedRating = Math.round(averageRating);

  return (
    <Link to={`/recipes/${recipeId}`} className="text-decoration-none">
      <Card className="shadow-sm recipe-card mx-0 mx-sm-2">
        <div className="position-relative">
          <Card.Img variant="top" src={imageUrl} alt={title} loading="lazy" />
        </div>

        <Card.Header>
          <Card.Title className="fw-bold overflow-hidden">{title}</Card.Title>
        </Card.Header>

        <Card.Body>
          <Card.Subtitle className="text-muted">{category}</Card.Subtitle>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between align-items-baseline mt-2">
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${
                  star <= roundedRating
                    ? "bi-star-fill text-warning"
                    : "bi-star"
                }`}
              />
            ))}
          </div>

          <div className="d-flex align-items-center">
            <i className="bi bi-chat-dots me-1" />
            <small>{commentsCount}</small>
          </div>
        </Card.Footer>
      </Card>
    </Link>
  );
}
