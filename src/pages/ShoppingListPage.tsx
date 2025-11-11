import { useShoppingList, type Ingredient } from "../hooks/useShoppingList";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";
import QuantitySelector from "../components/QuantitySelector";
import Box from "../components/shared/Box.tsx";

import IngredientSearch from "../components/shoppingList/IngredientSearch";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Inköpslistan",
  index: 4,
  adminOnly: false,
  protected: true,
};

export default function ShoppingListPage() {
  const { shoppingList, addIngredientToShoppingList } = useShoppingList();

  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);

  const [clearSearchText, setClearSearchText] = useState(0);
  const [amount, setAmount] = useState("");
  const numberAmount = Number(amount);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (numberAmount <= 0 || selectedIngredient == undefined) return;

    await addIngredientToShoppingList(selectedIngredient, numberAmount);

    setSelectedIngredient(undefined);
    setClearSearchText((prev) => prev + 1);
    setAmount("");
  }

  return (
    <Box size="l" className="custom-class">
      <Row className="p-0">
        <Col className="mt-4 mx-xl-5">
          <h2>Inköpslista</h2>

          <div className="shopping-list-container">
            <Form onSubmit={handleAdd}>
              <Row className="mt-4">
                <Col xs={12} xl={4} className="mb-3">
                  <Form.Group>
                    <IngredientSearch
                      clearSearchText={clearSearchText}
                      onIngredientChange={(ingredient) =>
                        setSelectedIngredient(ingredient)
                      }
                    />
                  </Form.Group>
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

            {shoppingList != null && shoppingList.items ? (
              <div className="shopping-list-container m-2 fs-6 mt-4">
                {shoppingList.items.map((shoppingItem) => (
                  <Row
                    key={shoppingItem.id}
                    className="shopping-list-item d-flex align-items-center pt-2 pb-2"
                  >
                    {/* Ingredient */}
                    <Col xs={12} md={12} lg={3} className="mb-2">
                      <span>
                        <b>Ingrediens:</b>{" "}
                      </span>
                      {shoppingItem.ingredient?.title}
                    </Col>

                    {/* Product Selector */}
                    <Col
                      xs={12}
                      md={8}
                      lg={6}
                      className="mt-1 mb-2 d-flex align-items-center"
                    >
                      <b className="me-2">Produkt:</b>
                      <Form.Select size="sm">
                        <option value="">Välj produkt</option>
                      </Form.Select>
                    </Col>

                    {/* Total Cost */}
                    <Col xs={6} md={2} lg={2}>
                      <b>Total kostnad:</b> 5 kr
                    </Col>

                    {/* Quantity Selector */}
                    <Col
                      xs={6}
                      md={2}
                      lg={1}
                      className="d-flex justify-content-end"
                    >
                      <QuantitySelector value={1} />
                    </Col>
                  </Row>
                ))}

                {/* Add to Cart Button */}
                <div className="d-flex justify-content-end mt-3 mb-4">
                  <div className="me-3">
                    <b>Summa:</b> kr
                  </div>
                  <Button>Lägg till produkter i varukorg</Button>
                </div>
              </div>
            ) : (
              <div
                className="d-flex justify-content-center align-items-center mt-5 mb-5"
                style={{ color: "#9b9d9eff" }}
              >
                <h1>Inköpslistan är tom...</h1>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Box>
  );
}
