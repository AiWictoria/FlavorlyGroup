import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";
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
  const isCreate = mode === "create";

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const getString = (v: unknown): string => {
      return typeof v === "string" ? v : v != null ? String(v) : "";
    };
    // Fetch all taxonomy terms; for testing this lists all terms
    // Backend supports generic GET /api/{contentType}
    async function fetchCategories() {
      try {
        const res = await fetch("/api/raw/Taxonomy/4xt2ey1mb7dq5zefaff51f1j4x");
        const data = await res.json();
        if (res.ok && data && typeof data === "object") {
          const taxonomyPart = (data as Record<string, unknown>)["TaxonomyPart"] as Record<string, unknown> | undefined;
          const terms = Array.isArray(taxonomyPart?.["Terms"]) ? (taxonomyPart?.["Terms"] as Array<Record<string, unknown>>) : [];
          const mapped = terms
            .map((t) => ({
              id: getString(t["ContentItemId"]),
              title: getString(((t["TitlePart"] as Record<string, unknown> | undefined)?.["Title"]) ?? t["DisplayText"]),
            }))
            .filter((x) => x.title);
          setCategories(mapped);
        }
      } catch {
        // Silent fail for testing mode
      }
    }
    fetchCategories();
  }, []);

  if (isView) {
    return (
      <>
        <div className="my-1 my-md-4">
          <h1 className="fs-1">{recipe?.title || "Title"}</h1>
          <h4>{recipe?.category || "Category"}</h4>
        </div>
      </>
    );
  }

  return (
    <>
      <Form.Group>
        <Form.Label className="fs-1">Title</Form.Label>
        <Form.Control
          required
          type="text"
          placeholder={isCreate ? "Enter new title" : "Update title"}
          value={recipe?.title || ""}
          onChange={(e) => onChange?.("title", e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Label className="fs-2">Category</Form.Label>
        <Form.Select
          required
          value={recipe?.category || ""}
          onChange={(e) => onChange?.("category", e.target.value)}
        >
          <option value="" disabled>
            {isCreate ? "Select category" : "Choose category"}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.title}>
              {c.title}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </>
  );
}
