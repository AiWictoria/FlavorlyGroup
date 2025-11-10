import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeLayout from "../components/recipe/RecipeLayout";
import { useAuth } from "../features/auth/AuthContext";

CreateRecipe.route = {
  path: "/createRecipe",
  menuLabel: "Skapa Recept",
  index: 2,
  protected: true,
};

export default function CreateRecipe() {
  const { user } = useAuth();
  const { createRecipe, uploadImage } = useRecipes();
  const [recipe, setRecipe] = useState({
    id: 0,
    userId: user?.userId || 0,
    title: "",
    category: "",
    ingredients: "",
    instructions: "",
    image: null as File | null,
  });

  function handleChange(field: string, value: string) {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileSelect(file: File | null) {
    setRecipe((prev) => ({ ...prev, image: file }));
  }

  async function handleSubmit() {
    const result = await createRecipe({
      title: recipe.title,
      category: recipe.category,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image,
    });

    if (result?.success && recipe.image) {
      await uploadImage(recipe.image);
    }
    if (result.success) {
      setRecipe({
        id: 0,
        userId: 0,
        title: "",
        category: "",
        ingredients: "",
        instructions: "",
        image: null,
      });
    }
  }

  return (
    <>
      <RecipeLayout
        mode="create"
        recipe={recipe}
        onChange={handleChange}
        onFileSelect={handleFileSelect}
        onSubmit={handleSubmit}
      />
    </>
  );
}
