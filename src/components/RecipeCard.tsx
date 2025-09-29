import { Card } from "react-bootstrap";

interface RecipeCardProps {
  title: string;
  category: string;
  imageUrl?: string;
  rating?: number;
  commentsCount?: number;
}

export default function RecipeCard({
  title,
  category,
  imageUrl = "/images/placeholder.png",
  rating = 0,
  commentsCount = 0,
}: RecipeCardProps) {
  return (
    <Card className="shadow-sm recipe-card">
      <div className="position-relative">
        <Card.Img variant="top" src={imageUrl} alt={title} />
      </div>

      <Card.Header>
        <Card.Title className="fw-bold">{title}</Card.Title>
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
                star <= rating ? "bi-star-fill text-warning" : "bi-star"
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
  );
}
