import { RecipeImageSection } from "./RecipeImageSection";
import { RecipeTitleSection } from "./RecipeTitleSection";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";
import { Form, Button, Row, Col } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";
import type { RecipeItemDto } from "@models/recipe";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe | null;
  onSubmit?: (recipe: Recipe) => void;
  onChange?: (field: string, value: string) => void;
  onFileSelect?: (file: File | null) => void;
  onRecipeItemsChange?: (items: RecipeItemDto[]) => void;
  previewUrl?: string | null;
}

export default function RecipeLayout({
  mode,
  recipe,
  onSubmit,
  onChange,
  onFileSelect,
  onRecipeItemsChange,
  previewUrl,
}: RecipeLayoutProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmit) onSubmit(recipe!);
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row className="bg-secondary border-top border-primary">
          <Col lg={6} className="p-0 order-lg-2 mb-1 mb-lg-4">
            <RecipeImageSection
              mode={mode}
              recipe={recipe ?? undefined}
              onFileSelect={onFileSelect}
              previewUrl={previewUrl}
            />
          </Col>

          <Col md={6} className="mb-3 pt-4 px-5 p-xxl-5 ps-xxl-5">
            <RecipeTitleSection
              mode={mode}
              recipe={recipe}
              onChange={onChange}
            />
            <RecipeIngredients
              mode={mode}
              recipe={recipe}
              onChange={onChange}
              onRecipeItemsChange={onRecipeItemsChange}
            />
          </Col>
        </Row>
        <Row className="mx-4 pb-3">
          <Col
            lg={8}
            className="mx-auto d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px", overflowY: "auto" }}
          >
            <RecipeInstructions
              mode={mode}
              recipe={recipe}
              onChange={onChange}
            />
          </Col>
        </Row>

        {(mode === "create" || mode === "edit") && (
          <div className="text-end pb-4 px-5">
            <Button type="submit" className="bg-primary">
              {mode === "create" ? "Skapa recept" : "Spara ändringar"}
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
