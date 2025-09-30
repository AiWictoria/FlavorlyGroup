import { RecipeImageSection } from "../components/recipe/RecipeImageSection";
import { RecipeTitleSection } from "../components/recipe/RecipeTitleSection";
import { RecipeIngredients } from "../components/recipe/RecipeIngredients";
import { RecipeInstructions } from "../components/recipe/RecipeInstructions";
import { Form, Button, Row, Col } from "react-bootstrap";
import type { Recipe } from "../hooks/useRecipes";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
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
  const roundedRating = Math.round(recipe?.averageRating ?? 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmit) onSubmit(recipe!);
  }

  return (
    <>
      <Form onSubmit={handleSubmit} className="mt-4 pt-4">
        <Row>
          <Col lg={6} xxl={7} className="p-0 order-lg-2">
            <RecipeImageSection
              mode={mode}
              recipe={recipe}
              roundedRating={roundedRating}
              onFileSelect={onFileSelect}
            />
          </Col>

          <Col md={6} xxl={5} className="mt-3 pt-4 px-5 p-xxl-5 ps-xxl-5">
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

        <Row className="mx-4 pb-5">
          <Col lg={8} className="mx-auto">
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
