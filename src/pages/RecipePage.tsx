import { Card, Col, Row } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";

RecipePage.route = {
  path: "recipes",
  menuLabel: "Recipes",
  index: 2,
};

export default function RecipePage() {
  const { recipes } = useRecipes();

  return (
    <>
      <h2>Recipes</h2>
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
    </>
  );
}
