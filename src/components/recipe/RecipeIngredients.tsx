import { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, Badge } from "react-bootstrap";
import type { Recipe } from "../../hooks/useRecipes";
import { useShoppingList } from "../../hooks/useShoppingList";
import { useAuth } from "../../features/auth/AuthContext";
import IngredientSearch, { type Ingredient as UiIngredient } from "../shoppingList/IngredientSearch";
import type { RecipeItemDto } from "@models/recipe";

interface RecipeIngredientsProps {
  mode: "view" | "edit" | "create";
  recipe?: Recipe;
  onChange?: (field: string, value: string) => void;
  onRecipeItemsChange?: (items: RecipeItemDto[]) => void;
}

export function RecipeIngredients({
  mode,
  recipe,
  onChange,
  onRecipeItemsChange,
}: RecipeIngredientsProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const { addItem } = useShoppingList();
  const { user } = useAuth();

  // Structured recipe items (for Orchard Core)
  const [selectedIngredient, setSelectedIngredient] = useState<UiIngredient | undefined>(undefined);
  const [amount, setAmount] = useState<string>("");
  const [unitText, setUnitText] = useState<string>("");
  const [structuredItems, setStructuredItems] = useState<{
    id: string; // tmp id for list rendering
    ingredient: UiIngredient;
    quantity: number;
    unitId?: string;
    unitTitle?: string;
  }[]>([]);
  const initializedFromRecipe = useRef(false);

  useEffect(() => {
    const value: any = recipe?.ingredients as any;
    if (Array.isArray(value)) {
      const parts = value.map((ing: any) => {
        const segments: string[] = [];
        if (ing.quantity !== undefined && ing.quantity !== null)
          segments.push(String(ing.quantity));
        if (ing.unit) segments.push(ing.unit.name ?? ing.unit.title ?? ing.unit.unitCode ?? "");
        const ingName = ing.ingredient?.name ?? ing.ingredient?.title ?? "";
        if (ingName) segments.push(ingName);
        else if (ing.ingredientId) segments.push(`#${ing.ingredientId}`);
        return segments.filter(Boolean).join(" ");
      });
      setIngredientList(parts);
      setCheckedItems(new Array(parts.length).fill(false));
      // Pre-populate structured items once when entering edit
      if (isEdit && !initializedFromRecipe.current) {
        const initial = value.map((ing: any) => {
          const name = ing.ingredient?.name ?? ing.ingredient?.title ?? "";
          const unitTitle = ing.unit?.name ?? ing.unit?.title ?? "";
          const mapped: UiIngredient = {
            id: ing.ingredient?.id ?? ing.ingredientId ?? "",
            title: name,
            baseUnit: ing.unit?.id || unitTitle ? { id: ing.unit?.id ?? "", title: unitTitle } : undefined,
            products: [],
          } as UiIngredient;
          return {
            id: crypto.randomUUID(),
            ingredient: mapped,
            quantity: Number(ing.quantity ?? 0) || 0,
            unitId: ing.unit?.id,
            unitTitle,
          };
        });
        setStructuredItems(initial);
        initializedFromRecipe.current = true;
        // Do NOT propagate on initial load to avoid duplicating items on save
      }
      return;
    }
    if (typeof value === "string") {
      const parts = value
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      setIngredientList(parts.length > 0 ? parts : [""]);
      setCheckedItems(new Array(parts.length > 0 ? parts.length : 1).fill(false));
      return;
    }
    setIngredientList([""]);
    setCheckedItems([false]);
  }, [recipe]);

  useEffect(() => {
    // Default unit text to ingredient's base unit title when picking a new ingredient
    setUnitText(selectedIngredient?.baseUnit?.title ?? "");
  }, [selectedIngredient]);

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
      <h2>Ingredienser</h2>

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
                Lägg till i inköpslistan
              </Button>
            )}
          </div>
        </>
      )}

      {isCreate && (
        <>
          {/* Structured ingredient builder (Orchard) */}
          <div className="mb-3">
        <Row className="g-2 align-items-end">
          <Col xs={12} md={6} lg={6}>
            <IngredientSearch onIngredientChange={setSelectedIngredient} />
          </Col>
          <Col xs={6} md={3} lg={3}>
                <Form.Control
                  placeholder="Mängd"
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Col>
              <Col xs={6} md={3} lg={3}>
                <Form.Control
                  placeholder="Enhet (t.ex. dl)"
                  value={unitText}
                  onChange={(e) => setUnitText(e.target.value)}
                />
              </Col>
            </Row>
            <div className="mt-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  const qty = Number(amount);
                  if (!selectedIngredient || !Number.isFinite(qty) || qty <= 0) return;
                  const unitId = selectedIngredient.baseUnit?.id;
                  const entry = {
                    id: crypto.randomUUID(),
                    ingredient: selectedIngredient,
                    quantity: qty,
                    unitId,
                    unitTitle: unitText || selectedIngredient.baseUnit?.title,
                  };
                  const next = [...structuredItems, entry];
                  setStructuredItems(next);
                  // propagate as RecipeItemDto[]
                  const dtoItems: RecipeItemDto[] = next.map((x) => ({
                    contentType: "RecipeItem",
                    ingredientId: x.ingredient.id,
                    quantity: x.quantity,
                    unitId: x.unitId,
                  }));
                  onRecipeItemsChange?.(dtoItems);
                  // reset pickers
                  setSelectedIngredient(undefined);
                  setAmount("");
                }}
              >
                + Lägg till ingrediens
              </Button>
            </div>

            {structuredItems.length > 0 && (
              <div className="mt-3">
                {structuredItems.map((it, idx) => (
                  <div key={it.id} className="d-flex align-items-center mb-2 w-100" style={{ gap: 8 }}>
                    <div className="flex-grow-1">
                      {it.ingredient.title}
                    </div>
                    <Form.Control
                      style={{ width: 110 }}
                      type="number"
                      min={0}
                      step={0.1}
                      value={it.quantity}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        const next = structuredItems.map((x, i) => i === idx ? { ...x, quantity: q } : x);
                        setStructuredItems(next);
                        const dtoItems: RecipeItemDto[] = next.map((x) => ({
                          contentType: "RecipeItem",
                          ingredientId: x.ingredient.id,
                          quantity: x.quantity,
                          unitId: x.unitId,
                        }));
                        onRecipeItemsChange?.(dtoItems);
                      }}
                    />
                    <Form.Control
                      style={{ width: 140 }}
                      placeholder="Enhet"
                      value={it.unitTitle ?? ""}
                      onChange={(e) => {
                        const ut = e.target.value;
                        const next = structuredItems.map((x, i) => i === idx ? { ...x, unitTitle: ut } : x);
                        setStructuredItems(next);
                        const dtoItems: RecipeItemDto[] = next.map((x) => ({
                          contentType: "RecipeItem",
                          ingredientId: x.ingredient.id,
                          quantity: x.quantity,
                          unitId: x.unitId,
                        }));
                        onRecipeItemsChange?.(dtoItems);
                      }}
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const next = structuredItems.filter((x) => x.id !== it.id);
                        setStructuredItems(next);
                        const dtoItems: RecipeItemDto[] = next.map((x) => ({
                          contentType: "RecipeItem",
                          ingredientId: x.ingredient.id,
                          quantity: x.quantity,
                          unitId: x.unitId,
                        }));
                        onRecipeItemsChange?.(dtoItems);
                      }}
                    >
                      Ta bort
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
