import { Link, useNavigate, useParams } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import type { Recipe } from "../hooks/useRecipes";
import { useEffect, useState } from "react";
import RecipeLayout from "./RecipeLayout";
import { useAuth } from "../hooks/useAuth";
import { RecipeComments } from "../components/recipe/RecipeComments";
import { Row, Col } from "react-bootstrap";

ViewRecipeDetails.route = {
  path: "/recipes/:id",
};

export default function ViewRecipeDetails() {
  const { id } = useParams();
  const { fetchRecipeById, deleteRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchRecipeById(Number(id)).then((data) => {
        if (data) setRecipe(data);
      });
    }
  }, [id]);

  async function handleDelete() {
    if (!recipe) return;
    const confirmDelete = confirm("You sure you want to delete this recipe?");
    if (!confirmDelete) return;

    const result = await deleteRecipe(recipe.id);
    if (result.success) {
      alert("Recipe deleted");
      navigate("/recipes");
    } else {
      alert("Something went wrong");
    }
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
