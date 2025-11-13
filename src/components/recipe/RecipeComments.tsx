import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useComments } from "../../hooks/useComments";
import { useAuth } from "../../features/auth/AuthContext";
import StarsRating from "./StarsRating";
import type { Recipe } from "../../hooks/useRecipes";

interface RecipeCommentsProps {
  recipe: Recipe;
}

export function RecipeComments({ recipe }: RecipeCommentsProps) {
  const { user } = useAuth();
  const { comments, setComments, addComment } = useComments(
    recipe.comments?.map((c) => ({
      id: c.id,
      recipeId: recipe.id,
      userId: recipe.userAuthor?.userId ?? "",
      author: c.firstName,
      content: c.text,
    })) ?? []
  );
  const [newComment, setNewComment] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await addComment(recipe.id, newComment, user.id);
    setNewComment("");
  }

  return (
    <>
      <Row className="mx-4 my-5 d-flex justify-content-center">
        <Col md={8}>
          <h3 className="mb-3 text-start">Kommentarer</h3>

          {comments.length === 0 && (
            <p className="text-center text-muted py-5">
              Inga kommentarer ännu.
            </p>
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
                <StarsRating recipeId={recipe.id} size="fs-5" mode="rate" />
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
