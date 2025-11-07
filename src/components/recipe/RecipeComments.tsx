import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useComments } from "../../hooks/useComments";
import { useAuth } from "../../hooks/useAuth";
import StarsRating from "./StarsRating";

interface RecipeCommentsProps {
  recipeId: number;
}

export function RecipeComments({ recipeId }: RecipeCommentsProps) {
  const { user } = useAuth();
  const { comments, fetchComments, addComment } = useComments();
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (recipeId) fetchComments(recipeId);
  }, [recipeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await addComment(recipeId, newComment, user.id);
    setNewComment("");
  }

  return (
    <>
      <Row className="mx-4 my-5 d-flex justify-content-center">
        <Col md={8}>
          <h3 className="mb-3 text-start">Kommentarer</h3>

          {comments.length === 0 && (
            <p className="text-center text-muted">Inga kommentarer ännu.</p>
          )}

          <div className="mb-3">
            {comments.map((c) => (
              <div key={c.id} className="border-bottom border-primary p-3">
                <div className="fw-bold my-2">{c.author}</div>
                <div className=" my-2">{c.content}</div>
              </div>
            ))}
          </div>

          {user && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="my-2 p-1">
                <StarsRating recipeId={recipeId} size="fs-5" mode="rate" />
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Skriv en kommentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mt-3"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">
                Ladda upp kommentar
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </>
  );
}
