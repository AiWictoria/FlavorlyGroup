import { Form, Button, Row, Col } from "react-bootstrap";
import type { Recipe } from "../hooks/useRecipes";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
}

export default function RecipeLayout({ mode, recipe }: RecipeLayoutProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  return (
    <>
      <Row className="mt-5">
        <Col md={4}>
          {/* Replace with actual image for recipe when view */}
          <img
            src={recipe?.imageUrl || "/images/recipes/placeholder.png"}
            alt={recipe?.title || "Recipe image"}
            className="w-100 rounded"
          />
          {!isView && (
            <Form.Group>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => {
                  const fileInput = e.target as HTMLInputElement;
                  const file = fileInput.files?.[0] || null;
                }}
              />
            </Form.Group>
          )}
        </Col>

        <Col md={8}>
          {isView && <h1 className="fs-1">{recipe?.title || "Title"}</h1>}
          {!isView && (
            <Form.Group>
              <Form.Label className="fs-1"> Title </Form.Label>
              <Form.Control placeholder="Enter Title" />
            </Form.Group>
          )}

          {isView && <h4>{recipe?.category || "Category"}</h4>}
          {!isView && (
            <Form.Group>
              <Form.Label className="fs-2"> Category </Form.Label>
              <Form.Control placeholder="Enter Category" />
            </Form.Group>
          )}

          <h2>Ingredients</h2>
          {/* Checkbox for creating shoppinglist in future */}
          {isView && (
            <ul>
              {recipe?.ingredients?.split(",").map((ingredient, i) => (
                <li key={i} className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id={`ingredient-${i}`}
                    className="me-2"
                  />
                  {ingredient.trim()}
                </li>
              ))}
            </ul>
          )}

          {!isView && (
            <>
              <Form.Group className="d-flex align-items-center">
                <Form.Control placeholder="Enter Category" />
                <Button variant="outline-danger" size="sm" className="ms-2">
                  -
                </Button>
              </Form.Group>
              <Button variant="outline-primary" size="sm">
                + Add ingredient
              </Button>
            </>
          )}

          <h2>Instructions</h2>
          {isView && (
            <ul>
              {recipe?.instructions?.split(",").map((instructions, i) => (
                <li key={i} className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id={`ingredient-${i}`}
                    className="me-2"
                  />
                  {instructions.trim()}
                </li>
              ))}
            </ul>
          )}

          {!isView && (
            <>
              <Form.Group className="d-flex align-items-center">
                <Form.Control placeholder="Step" />
                <Button variant="outline-danger" size="sm" className="ms-2">
                  -
                </Button>
              </Form.Group>
              <Button variant="outline-primary" size="sm">
                + Add step
              </Button>
            </>
          )}
        </Col>
      </Row>
      {!isView && (
        <Button type="submit" className="bg-success">
          Save Recipe
        </Button>
      )}
    </>
  );
}
