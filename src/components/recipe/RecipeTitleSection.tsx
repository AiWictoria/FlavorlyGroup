import { Form } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";

interface RecipeTitleSectionProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  onChange?: (field: string, value: string) => void;
}

export function RecipeTitleSection({
  mode,
  recipe,
  onChange,
}: RecipeTitleSectionProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  if (isView) {
    return (
      <>
        <h1 className="fs-1">{recipe?.title || "Title"}</h1>
        <h4>{recipe?.category || "Category"}</h4>
      </>
    );
  }

  return (
    <>
      <Form.Group>
        <Form.Label className="fs-1">Title</Form.Label>
        <Form.Control
          type="text"
          placeholder={isCreate ? "Enter new title" : "Update title"}
          value={recipe?.title || ""}
          onChange={(e) => onChange?.("title", e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Label className="fs-2">Category</Form.Label>
        <Form.Control
          type="text"
          placeholder={isCreate ? "Enter category" : "Update category"}
          value={recipe?.category || ""}
          onChange={(e) => onChange?.("category", e.target.value)}
        />
      </Form.Group>
    </>
  );
}
