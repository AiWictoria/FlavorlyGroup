import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";
import { useSavedRecipes } from "../../hooks/useSavedRecipes";
import { useAuth } from "../../hooks/useAuth";
import StarsRating from "./StarsRating";

interface RecipeImageSectionProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  onFileSelect?: (file: File | null) => void;
}

export function RecipeImageSection({
  mode,
  recipe,
  onFileSelect,
}: RecipeImageSectionProps) {
  const isView = mode === "view";

  const { user } = useAuth();
  const { savedRecipes, saveRecipe, removeSaved } = useSavedRecipes();

  const isSaved = recipe
    ? savedRecipes.some((r) => r.recipeId === recipe.id)
    : false;

  return (
    <div>
      <div className="ratio ratio-16x9 rounded">
        <img
          src={recipe?.imageUrl || "/images/recipes/placeholder.png"}
          alt={recipe?.title || "Recipe image"}
          className="object-fit-cover w-100"
        />
      </div>

      {isView && user && (
        <div className="d-flex align-items-center justify-content-between mt-3 mx-3 px-2">
          <StarsRating recipeId={recipe!.id} size="fs-3" mode="view" />

          <Button
            variant={isSaved ? "outline-danger" : "danger"}
            className="mx-3 mx-lg-4 m-1"
            disabled={!user}
            onClick={() => {
              if (!recipe) return;

              if (isSaved) {
                const saved = savedRecipes.find(
                  (r) => r.recipeId === recipe.id
                );
                if (saved) removeSaved(saved.id);
              } else {
                saveRecipe(recipe.id);
              }
            }}
          >
            <i className={`bi ${isSaved ? "bi-heart-fill" : "bi-heart-fill"}`}>
              {isSaved ? " Saved" : " Save"}
            </i>
          </Button>
        </div>
      )}

      {mode !== "view" && (
        <Form.Group className=" m-5">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) => {
              const input = e.target as HTMLInputElement;
              const file = input.files?.[0] ?? null;
              onFileSelect?.(file);
            }}
          />
        </Form.Group>
      )}
    </div>
  );
}
