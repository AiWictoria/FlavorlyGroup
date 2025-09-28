import { useState } from "react";
import { Card, Col, Dropdown, Row, Form, Button } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 2,
};

export default function RecipePage() {
  const { recipes } = useRecipes();
  const [form, setForm] = useState({
    title: "",
    category: "",
    ingredients: "",
    instructions: "",
  });

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Recipes
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Row xs="1" md="2" lg="4">
            {recipes.map((recipe) => (
              <Col key={recipe.id}>
                <Card>
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                    <Card.Subtitle>{recipe.category}</Card.Subtitle>
                    <Card.Text>
                      <strong>Ingredients: </strong>
                      {recipe.ingredients}
                    </Card.Text>
                    <Card.Text>
                      <strong>Instructions: </strong>
                      {recipe.instructions}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Dropdown.Menu>
      </Dropdown>

      <Form>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="title"
            name="title"
            value={form.title}
            onChange={setProperty}
            placeholder="Title"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="category"
            name="category"
            value={form.category}
            onChange={setProperty}
            placeholder="Category"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Ingredients</Form.Label>
          <Form.Control
            type="ingredients"
            name="ingredients"
            value={form.ingredients}
            onChange={setProperty}
            placeholder="Ingredients"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Instructions</Form.Label>
          <Form.Control
            type="instructions"
            name="instructions"
            value={form.instructions}
            onChange={setProperty}
            placeholder="Instructions"
            required
          />
        </Form.Group>
        <Button type="submit">Save recipe</Button>
      </Form>
    </>
  );
}
