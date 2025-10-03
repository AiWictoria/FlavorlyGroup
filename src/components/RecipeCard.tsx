import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import RatingStars from "./recipe/StarsRating";

interface RecipeCardProps {
  recipeId: number;
  title: string;
  category: string;
  imageUrl?: string;
  commentsCount?: number;
}

export default function RecipeCard({
  recipeId,
  title,
  category,
  imageUrl = "/images/recipes/placeholder.png",
  commentsCount = 0,
}: RecipeCardProps) {
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
          <RatingStars recipeId={recipeId} size="fs-5" />

          <div className="d-flex align-items-center">
            <i className="bi bi-chat-dots me-1" />
            <small>{commentsCount}</small>
          </div>
        </Card.Footer>
      </Card>
    </Link>
  );
}
