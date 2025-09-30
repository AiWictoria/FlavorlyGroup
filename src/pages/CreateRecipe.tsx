import { useState } from "react";
import { useRecipes } from "../hooks/useRecipes";
import RecipeLayout from "./RecipeLayout";
import { useAuth } from "../hooks/useAuth";

CreateRecipe.route = {
  path: "/createRecipe",
  menuLabel: "Create Recipe",
  index: 2,
};

export default function CreateRecipe() {
  const { user } = useAuth();
  const { createRecipe, uploadImage } = useRecipes();
  const [recipe, setRecipe] = useState({
    id: 0,
    userId: user?.id || 0,
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
    const result = await createRecipe(recipe);
    if (!result?.success) {
      alert("Något gick fel");
      return;
    }

    alert("Recept skapat!");

    if (recipe.image) {
      const uploadResult = await uploadImage(result.insertId, recipe.image);

      if (!uploadResult.success) {
        alert("Något gick fel vid uppladdning av bilden");
        console.error(uploadResult.error);
      } else {
        console.log("Bild uppladdad:", uploadResult.imageUrl);
      }
    }

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

  return (
    <RecipeLayout
      mode="create"
      recipe={recipe}
      onChange={handleChange}
      onFileSelect={handleFileSelect}
      onSubmit={handleSubmit}
    />
  );
}
