import { RecipeImageSection } from "./RecipeImageSection";
import { RecipeTitleSection } from "./RecipeTitleSection";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";
import { Form, Button, Row, Col } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe | null;
  onSubmit?: (recipe: Recipe) => void;
  onChange?: (field: string, value: string) => void;
  onFileSelect?: (file: File | null) => void;
}

export default function RecipeLayout({
  mode,
  recipe,
  onSubmit,
  onChange,
  onFileSelect,
}: RecipeLayoutProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmit) onSubmit(recipe!);
  }

  return (
    <>
      <Form onSubmit={handleSubmit} className="mt-4 pt-4">
        <Row className="bg-secondary border-top border-primary">
          <Col lg={6} className="p-0 order-lg-2 mb-1 mb-lg-4">
            <RecipeImageSection
              mode={mode}
              recipe={recipe ?? undefined}
              onFileSelect={onFileSelect}
            />
          </Col>

          <Col md={6} className="mt-3 mb-3 pt-4 px-5 p-xxl-5 ps-xxl-5">
            <RecipeTitleSection
              mode={mode}
              recipe={recipe}
              onChange={onChange}
            />
            <RecipeIngredients
              mode={mode}
              recipe={recipe}
              onChange={onChange}
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
            <Button type="submit" className="bg-success">
              {mode === "create" ? "Create Recipe" : "Save Changes"}
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
