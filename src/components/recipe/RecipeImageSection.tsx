import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";
import { useSavedRecipes } from "../../hooks/useSavedRecipes";
import { useAuth } from "../../hooks/useAuth";

interface RecipeImageSectionProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  roundedRating: number;
  onFileSelect?: (file: File | null) => void;
}

export function RecipeImageSection({
  mode,
  recipe,
  roundedRating,
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
        <div className="d-flex align-items-center justify-content-between mt-3 mx-3">
          <div className="mx-4 fs-3">
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

          <Button
            variant={isSaved ? "danger" : "outline-danger"}
            className="mx-3 mx-lg-5 m-1"
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
