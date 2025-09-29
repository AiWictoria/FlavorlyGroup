import { useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";
import RecipeCard from "../components/RecipeCard";

RecipePage.route = {
  path: "/recipes",
  menuLabel: "Recipes",
  index: 2,
};

export default function RecipePage() {
  const { recipes, createRecipe } = useRecipes();
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
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await createRecipe(form);

    if (result?.success) {
      alert("Recept skapat");
      setForm({ title: "", category: "", ingredients: "", instructions: "" });
    } else {
      alert("Något gick fel");
      console.log(result?.error);
    }
  }
  return (
    <>
      <h2>Recipes</h2>
      <Row xs={1} md={2} lg={4} className="g-4">
        {recipes.map((recipe) => (
          <Col key={recipe.id}>
            <RecipeCard
              title={recipe.title}
              category={recipe.category}
              imageUrl="/images/start.jpg"
              rating={4}
              commentsCount={3}
            />
          </Col>
        ))}
      </Row>

      <Form onSubmit={handleSubmit}>
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
