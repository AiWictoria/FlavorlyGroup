import { Form, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";
import QuantitySelector from "../components/QuantitySelector";
import Box from "../components/shared/Box.tsx";
import IngredientSearch, { type Ingredient } from "../components/shoppingList/IngredientSearch";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Inköpslistan",
  index: 4,
  adminOnly: false,
  protected: true,
};

const sek = (v: number) =>
  Number.isFinite(v) ? v.toLocaleString("sv-SE", { style: "currency", currency: "SEK" }) : "–";

type ShoppingItem = {
  id: string;
  ingredient: Ingredient & { amount: number };
  selectedProductId?: string;
  quantity: number;
};

export default function ShoppingListPage() {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | undefined>(undefined);
  const [clearSearchText, setClearSearchText] = useState(0);
  const [amount, setAmount] = useState("");
  const numberAmount = Number(amount);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (numberAmount <= 0 || !selectedIngredient) return;

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      ingredient: { ...selectedIngredient, amount: numberAmount },
      selectedProductId: undefined,
      quantity: 1,
    };

    setShoppingList(prev => [...prev, newItem]);
    setSelectedIngredient(undefined);
    setClearSearchText(prev => prev + 1);
    setAmount("");
  };

  const updateItem = (idx: number, patch: Partial<ShoppingItem>) => {
    setShoppingList(list => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const removeItem = (idx: number) => {
    setShoppingList(list => list.filter((_, i) => i !== idx));
  };

  const getSelectedProduct = (item: ShoppingItem) =>
    item.ingredient.products.find(p => p.id === item.selectedProductId);

  const rowCost = (item: ShoppingItem) => {
    const p = getSelectedProduct(item);
    const price = p?.price ?? 0;
    const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
    return price * qty;
  };
  const totalCost = shoppingList.reduce((sum, it) => sum + rowCost(it), 0);

  return (
    <Box size="l" className="custom-class">
      <Row className="p-0">
        <Col className="mt-4 mx-xl-5">
          <h2>Inköpslista</h2>

          <Form onSubmit={addItem}>
            <Row className="mt-4">
              <Col xs={12} xl={4} className="mb-3">
                <IngredientSearch
                  clearSearchText={clearSearchText}
                  onIngredientChange={setSelectedIngredient}
                />
              </Col>

              <Col xs={6} xl={3} className="mb-2">
                <Form.Control
                  placeholder="Välj mängd..."
                  value={amount}
                  required
                  type="number"
                  min={0.5}
                  max={99}
                  step={0.5}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Col>

              <Col xs={6} xl={2}>
                <Form.Control
                  placeholder="Enhet"
                  disabled
                  value={selectedIngredient?.baseUnit?.title ?? ""}
                />
              </Col>

              <Col xs={12} xl={3}>
                <div className="d-grid gap-2">
                  <Button variant="success" type="submit" className="w-auto">
                    Lägg till ingrediens
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>

          {shoppingList.length > 0 ? (
            <>
              <Col className="m-2 fs-6 mt-4">
                {shoppingList.map((item, index) => (
                  <Row key={item.id} className="shopping-list-item d-flex align-items-center pt-2 pb-2">
                    <Col xs={12} md={12} lg={3} className="mb-2">
                      <b>Ingrediens:</b> {item.ingredient.title} {item.ingredient.amount}{" "}
                      {item.ingredient.baseUnit?.title}
                    </Col>

                    <Col xs={12} md={8} lg={6} className="mt-1 mb-2 d-flex align-items-center">
                      <b className="me-2">Produkt:</b>
                      <Form.Select
                        size="sm"
                        value={item.selectedProductId ?? ""}
                        onChange={(e) => updateItem(index, { selectedProductId: e.target.value })}
                      >
                        <option value="">Välj produkt</option>
                        {item.ingredient.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {sek(p.price)}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col xs={6} md={2} lg={2}>
                      <b>Total kostnad:</b> {sek(rowCost(item))}
                    </Col>

                    <Col xs={6} md={2} lg={1} className="d-flex justify-content-end">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(newValue) => updateItem(index, { quantity: newValue })}
                        onRemove={() => removeItem(index)}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>

              <div className="d-flex justify-content-end mt-3 mb-4">
                <div className="me-3"><b>Summa:</b> {totalCost.toFixed(2)} kr</div>
                <Button>Lägg till produkter i varukorg</Button>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-center align-items-center mt-5 mb-5" style={{ color: "#9b9d9eff" }}>
              <h1>Inköpslistan är tom...</h1>
            </div>
          )}
        </Col>
      </Row>
    </Box>
  );
}
