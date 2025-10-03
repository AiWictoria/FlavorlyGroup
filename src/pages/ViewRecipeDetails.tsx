import { Link, useParams } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import type { Recipe } from "../hooks/useRecipes";
import { useEffect, useState } from "react";
import RecipeLayout from "../components/recipe/RecipeLayout";
import { useAuth } from "../hooks/useAuth";
import { RecipeComments } from "../components/recipe/RecipeComments";
import { Row, Col, Button } from "react-bootstrap";
import toast from "react-hot-toast";

ViewRecipeDetails.route = {
  path: "/recipes/:id",
};

export default function ViewRecipeDetails() {
  const { id } = useParams();
  const { fetchRecipeById, deleteRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchRecipeById(Number(id)).then((data) => {
        if (data) setRecipe(data);
      });
    }
  }, [id]);

  async function handleDelete() {
    if (!recipe) return;

    toast.custom((t) => (
      <Row className="bg-white p-3 rounded shadow d-flex flex-column gap-2">
        <Col>
          <p>Are you sure you want to delete this recipe?</p>
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="btn btn-danger"
              onClick={async () => {
                toast.dismiss(t.id);
                await deleteRecipe(recipe.id);
              }}
            >
              Delete
            </Button>
          </div>
        </Col>
      </Row>
    ));
  }

  if (!recipe) return;

  const isOwner = user && recipe.userId === user.id;
  return (
    <>
      <RecipeLayout mode="view" recipe={recipe} />
      {isOwner && (
        <div className="text-center my-3 pb-3">
          <Link
            to={`/recipes/${recipe.id}/edit`}
            className="btn btn-outline-primary me-2"
          >
            Edit
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
      <Row className="bg-secondary border-top border-primary">
        <Col>{recipe && <RecipeComments recipeId={recipe.id} />}</Col>
      </Row>
    </>
  );
}
