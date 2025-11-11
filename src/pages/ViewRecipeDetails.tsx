import { Link, useNavigate, useParams } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import type { Recipe } from "../hooks/useRecipes";
import { useEffect, useState } from "react";
import RecipeLayout from "../components/recipe/RecipeLayout";
import { useAuth } from "../features/auth/AuthContext";
import { RecipeComments } from "../components/recipe/RecipeComments";
import { Row, Col, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { getRecipe, deleteRecipe as apiDeleteRecipe } from "../api/recipeapi";

ViewRecipeDetails.route = {
  path: "/recipes/:id",
  adminOnly: false,
  protected: false,
};

export default function ViewRecipeDetails() {
  const { id } = useParams();
  const { } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    // Fetch via Orchard API and adapt to UI Recipe type
    (async () => {
      try {
        const r = await getRecipe(String(id));
        const uiRecipe: Recipe = {
          id: r.id,
          title: r.title,
          image: r.recipeImage?.paths?.[0] ?? undefined,
          slug: "",
          description: r.description ?? "",
          instructions: r.items
            .filter((i) => i.contentType === "Instruction")
            .map((i: any) => ({ order: i.order ?? i.step, text: i.text ?? i.content ?? "" })),
          categoryId: undefined,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          servings: r.servings,
          ingredients: r.items
            .filter((i) => i.contentType === "RecipeItem")
            .map((i: any) => ({
              ingredientId: i.ingredient?.id ?? "",
              ingredient: { id: i.ingredient?.id ?? "", name: i.ingredient?.title ?? i.ingredient?.name ?? "" },
              quantity: i.quantity ?? 0,
              unit: { id: i.unit?.id ?? "", name: i.unit?.title ?? "" },
            })),
          comments: r.items
            .filter((i) => i.contentType === "Comment")
            .map((i: any) => ({ text: i.content ?? "", authorUsername: i.user?.username ?? "" })),
          userAuthor: r.user
            ? ({ userId: r.user.id, username: r.user.username, userIds: [r.user.username] } as unknown as any)
            : undefined,
        } as unknown as Recipe;
        setRecipe(uiRecipe);
      } catch {
        toast.error("Vi kunde inte hitta det receptet");
      }
    })();
  }, [id]);

  async function handleDelete() {
    if (!recipe) return;

    toast.custom((t) => (
      <Row className="bg-white p-3 rounded shadow d-flex flex-column gap-2">
        <Col>
          <p>Är du säker på att du vill ta bort det här receptet?</p>
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
                try {
                  const res = await apiDeleteRecipe(String(recipe.id));
                  if (res?.success) {
                    toast.success("Receptet är borttaget");
                    navigate("/recipes");
                  } else {
                    toast.error("Misslyckades med att ta bort receptet");
                  }
                } catch {
                  toast.error("Misslyckades med att ta bort receptet");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </Col>
      </Row>
    ));
  }

  if (!recipe) return null;

  const isOwner = Boolean(
    user &&
      recipe.userAuthor &&
      typeof recipe.userAuthor === "object" &&
      "userIds" in (recipe.userAuthor as Record<string, unknown>) &&
      Array.isArray((recipe.userAuthor as { userIds?: string[] }).userIds) &&
      (
        (recipe.userAuthor as { userIds?: string[] }).userIds as string[]
      ).includes(user.username)
  );
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
        <Col>{recipe && <RecipeComments recipeId={Number(recipe.id)} />}</Col>
      </Row>
    </>
  );
}
