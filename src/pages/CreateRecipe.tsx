import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";

CreateRecipe.route = {
  path: "/createRecipe",
  menuLabel: "Create Recipe",
  index: 2,
};

export default function CreateRecipe() {
  const { createRecipe } = useRecipes();
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
      <h3>Create</h3>

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
