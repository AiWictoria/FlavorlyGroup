import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";

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

  return (
    <div>
      <div className="ratio ratio-16x9 rounded">
        <img
          src={recipe?.imageUrl || "/images/recipes/placeholder.png"}
          alt={recipe?.title || "Recipe image"}
          className="object-fit-cover w-100"
        />
      </div>

      {isView && (
        <div className="d-flex align-items-center justify-content-between mt-3">
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

          <Button variant="danger" className="mx-4 m-1">
            <i className="bi bi-heart"> Save</i>
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
