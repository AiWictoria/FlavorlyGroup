import { useParams } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import type { Recipe } from "../hooks/useRecipes";
import { useEffect, useState } from "react";
import RecipeLayout from "./RecipeLayout";

EditRecipeDetails.route = {
  path: "/recipes/:id/edit",
};

export default function EditRecipeDetails() {
  const { id } = useParams();
  const { fetchRecipeById } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipeById(Number(id)).then((data) => {
        if (data) setRecipe(data);
      });
    }
  }, [id]);

  if (!recipe) return <p>Loading.</p>;

  return (
    <>
      <RecipeLayout mode="edit" recipe={recipe} />
    </>
  );
}
