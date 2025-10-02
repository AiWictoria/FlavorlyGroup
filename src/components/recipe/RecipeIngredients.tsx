import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";
import { useShoppingList } from "../../hooks/useShoppingList";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

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
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const { addItem } = useShoppingList();
  const { user } = useAuth();

  useEffect(() => {
    if (recipe?.ingredients) {
      const parts = recipe.ingredients.split(",").map((i) => i.trim());
      setIngredientList(parts);
      setCheckedItems(new Array(parts.length).fill(false));
    } else {
      setIngredientList([""]);
      setCheckedItems([false]);
    }
  }, [recipe]);

  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredientList];
    updated[index] = value;
    setIngredientList(updated);
    onChange?.("ingredients", updated.join(","));
  };

  async function handleAddToList() {
    const selected = ingredientList.filter((_, i) => checkedItems[i]);
    for (const ingredient of selected) {
      await addItem(ingredient);
    }
    setCheckedItems(new Array(ingredientList.length).fill(false));
  }

  const addIngredient = () => {
    setIngredientList([...ingredientList, ""]);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredientList.filter((_, i) => i !== index);
    setIngredientList(updated);
    onChange?.("ingredients", updated.join(","));
  };

  return (
    <div className="pt-4 pt-md-5">
      <h2>Ingredients</h2>

      {isView && ingredientList.length > 0 && (
        <>
          <div className="m-3">
            <ul className="list-unstyled">
              {ingredientList.map((ingredient, i) => (
                <li key={i} className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id={`ingredient-${i}`}
                    className="m-2 fs-4"
                    checked={checkedItems[i] || false}
                    onChange={(e) => {
                      const updated = [...checkedItems];
                      updated[i] = e.target.checked;
                      setCheckedItems(updated);
                    }}
                  />
                  {ingredient}
                </li>
              ))}
            </ul>
            {user && (
              <Button variant="success" onClick={handleAddToList}>
                Add to shopping list
              </Button>
            )}
          </div>
        </>
      )}

      {(isEdit || isCreate) && (
        <>
          {ingredientList.map((ingredient, i) => (
            <Form.Group key={i} className="d-flex align-items-center mb-2">
              <Form.Control
                required
                placeholder={"Add ingredient"}
                value={ingredient}
                onChange={(e) => handleIngredientChange(i, e.target.value)}
              />
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={() => removeIngredient(i)}
              >
                -
              </Button>
            </Form.Group>
          ))}

          <Button
            className="mt-2"
            variant="success"
            size="sm"
            onClick={addIngredient}
          >
            + Add ingredient
          </Button>
        </>
      )}
    </div>
  );
}
