import { Form, Button, Row, Col } from "react-bootstrap";

interface RecipeLayoutProps {
  mode: "view" | "edit" | "create";
}

export default function RecipeLayout({ mode }: RecipeLayoutProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  return (
    <>
      <Row>
        <Col md={4}>
          <img
            src="/images/recipes/placeholder.png"
            alt="Preview"
            className="w-100 rounded"
          />
          <div>
            <div>Image</div>
            <Form.Control type="file" accept="image/*" />
          </div>
        </Col>

        <Col md={8}>
          <div>
            <div>Title</div>
            <Form.Control placeholder="Title" />
          </div>

          <div>
            <div>Category</div>
            <Form.Control placeholder="Category" />
          </div>

          <h5>Ingredients</h5>
          <div className="d-flex align-items-center">
            <Form.Check />
            <Form.Control placeholder="Ingredient" />

            {/* Should only be applied when creating or when editing a recipe
            <Button variant="outline-danger" size="sm" className="ms-2">
              -
            </Button> */}
          </div>

          {/* Should only be applied when creating or when editing a recipe
          <Button variant="outline-primary" size="sm">
            + Add ingredient
          </Button> */}

          <h5 className="mt-4">Instructions</h5>
          <div className="d-flex align-items-center">
            <Form.Check />
            <Form.Control placeholder="Step" />

            {/* Should only be applied when creating or when editing a recipe
            <Button variant="outline-danger" size="sm" className="ms-2">
              -
            </Button> */}
          </div>

          {/* Should only be applied when creating or when editing a recipe
          <Button variant="outline-primary" size="sm">
            + Add step
          </Button> */}
        </Col>
      </Row>

      <Button type="submit" className="bg-success">
        Save Recipe
      </Button>
    </>
  );
}
