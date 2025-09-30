import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useRecipes } from "../hooks/useRecipes";
import RecipeLayout from "./RecipeLayout";

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
    image: null as File | null,
  });

  function setProperty(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await createRecipe(form);

    if (!result?.success) {
      alert("Something went wrong");
      console.log(result?.error);
      return;
    }
    alert("Recept skapat!");

    const recipeId = result.insertId;

    if (form.image) {
      const formData = new FormData();
      formData.append("id", recipeId);
      formData.append("image", form.image);

      console.log("Uploading...", formData.get("image"));

      const uploadRes = await fetch("/api/imageUpload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) {
        alert("Något gick fel vid uppladdning av bild");
        console.log(uploadResult?.error);
        return;
      }
      console.log("image uploaded", uploadResult.imageUrl);
    }

    setForm({
      title: "",
      category: "",
      ingredients: "",
      instructions: "",
      image: null,
    });
  }
  return (
    <>
      <RecipeLayout mode="create"></RecipeLayout>

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

        <Form.Group>
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) => {
              const fileInput = e.target as HTMLInputElement;
              const file = fileInput.files?.[0] || null;
              setForm({ ...form, image: file });
            }}
          />
        </Form.Group>

        <Button type="submit">Save recipe</Button>
      </Form>
    </>
  );
}
