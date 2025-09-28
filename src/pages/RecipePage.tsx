import { Card, Col, Dropdown, Row, Form } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 2,
};

export default function RecipePage() {
  const { recipes } = useRecipes();

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

      <Form></Form>
    </>
  );
}
