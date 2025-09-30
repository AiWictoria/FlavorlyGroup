import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";

interface RecipeIngredientsProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  onChange?: (field: string, value: string) => void;
}

export function RecipeIngredients({
  mode,
  recipe,
  onChange,
}: RecipeIngredientsProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [ingredientList, setIngredientList] = useState<string[]>([]);

  useEffect(() => {
    if (recipe?.ingredients) {
      setIngredientList(recipe.ingredients.split(",").map((i) => i.trim()));
    } else {
      setIngredientList([""]);
    }
  }, [recipe]);

  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredientList];
    updated[index] = value;
    setIngredientList(updated);
    onChange?.("ingredients", updated.join(","));
  };

  const addIngredient = () => {
    setIngredientList([...ingredientList, ""]);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredientList.filter((_, i) => i !== index);
    setIngredientList(updated);
    onChange?.("ingredients", updated.join(","));
  };

  return (
    <div className="pt-4">
      <h2>Ingredients</h2>

      {isView && ingredientList.length > 0 && (
        <>
          <ul className="list-unstyled">
            {ingredientList.map((ingredient, i) => (
              <li key={i} className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id={`ingredient-${i}`}
                  className="m-2 fs-4"
                />
                {ingredient}
              </li>
            ))}
          </ul>
          <Button variant="outline-primary">Add to shopping list</Button>
        </>
      )}

      {(isEdit || isCreate) && (
        <>
          {ingredientList.map((ingredient, i) => (
            <Form.Group key={i} className="d-flex align-items-center mb-2">
              <Form.Control
                placeholder={"Add ingredient"}
                value={ingredient}
                onChange={(e) => handleIngredientChange(i, e.target.value)}
              />
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={() => removeIngredient(i)}
              >
                -
              </Button>
            </Form.Group>
          ))}

          <Button variant="outline-primary" size="sm" onClick={addIngredient}>
            + Add ingredient
          </Button>
        </>
      )}
    </div>
  );
}
