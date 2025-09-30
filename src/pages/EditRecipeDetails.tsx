import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecipes, type Recipe } from "../hooks/useRecipes";
import RecipeLayout from "../pages/RecipeLayout";

EditRecipeDetails.route = {
  path: "/recipes/:id/edit",
};

export default function EditRecipeDetails() {
  const { id } = useParams();
  const { fetchRecipeById, updateRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) fetchRecipeById(Number(id)).then((data) => setRecipe(data));
  }, [id]);

  function handleChange(field: string, value: string) {
    setRecipe((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSubmit() {
    if (!recipe) return;
    const result = await updateRecipe(recipe.id, recipe);
    if (result.success) alert("Recipe updated!");
  }

  if (!recipe) return <p>Loading...</p>;

  return (
    <RecipeLayout
      mode="edit"
      recipe={recipe}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
