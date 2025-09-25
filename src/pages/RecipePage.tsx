import { useState, useEffect } from "react";
import { Card, CardText, Col, Row } from "react-bootstrap";
RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 2,
};

export default function RecipePage() {
  const [recipes, setRecipes] = useState<any[]>([]);

  async function fetchRecipes() {
    const res = await fetch("/api/recipes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      setRecipes(data);
      console.log(data);
    } else {
      alert("Något gick fel");
    }
  }
  useEffect(() => {
    fetchRecipes();
  }, []);

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
