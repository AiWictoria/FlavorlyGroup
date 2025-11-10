import { useShoppingList } from "../hooks/useShoppingList";
import { Form, Button, Row, Col, Table, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import QuantitySelector from "../components/QuantitySelector";
import Box from "../components/shared/Box.tsx";
import type { Product } from "../components/shoppingList/IngredientSearch";

import IngredientSearch, {
  type Ingredient,
} from "../components/shoppingList/IngredientSearch";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Inköpslistan",
  index: 4,
  adminOnly: false,
  protected: true,
};

interface ShoppingItem {
  id: string;
  ingredient: Ingredient;
  productName: string;
  productPrice: number;
  productQuantity: number;
  productUnit: string;
}

export default function ShoppingListPage() {
  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);

  const [clearSearchText, setClearSearchText] = useState(0);
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const numberAmount = Number(amount);

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (numberAmount <= 0 || selectedIngredient == undefined) return;

    const updatedIngredient = {
      ...selectedIngredient,
      amount: numberAmount,
    };

    const newShoppingItem: ShoppingItem = {
      id: "",
      ingredient: updatedIngredient,
      productName: "",
      productPrice: 0,
      productQuantity: 0,
      productUnit: "",
    };

    setSelectedIngredient(undefined);
    setClearSearchText((prev) => prev + 1);
    setAmount("");
    setShoppingList((prevList) => [...prevList, newShoppingItem]);
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
                <Col xs={6} xl={3} className="mb-2">
                  <Form.Group>
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
                  </Form.Group>
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
                    <>
                      <Row
                        key={index}
                        className="shopping-list-item d-flex align-items-center pt-2 pb-2 "
                      >
                        <Col xs={12} md={12} lg={3} className="mb-2">
                          <span>
                            <b>Ingrediens:</b>{" "}
                          </span>
                          {item.ingredient.title} {item.ingredient.amount}{" "}
                          {item.ingredient.baseUnit?.title}{" "}
                        </Col>

                        <Col
                          xs={12}
                          md={8}
                          lg={6}
                          className="mt-1 mb-2 d-flex align-items-center"
                        >
                          <b className="me-2">Produkt:</b>
                          <Form.Select
                            size="sm"
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                          >
                            <option value="">Välj produkt</option>
                            {item.ingredient.productId?.map(
                              (product: Product) => (
                                <>
                                  <option key={product.id} value={product.name}>
                                    {product.name ?? product.id}
                                  </option>
                                </>
                              )
                            )}
                          </Form.Select>
                        </Col>
                        <Col xs={6} md={2} lg={2}>
                          <b>Total kostnad:</b> 5 kr
                        </Col>
                        <Col
                          xs={6}
                          md={2}
                          lg={1}
                          className="d-flex justify-content-end"
                        >
                          <QuantitySelector value={1}></QuantitySelector>
                        </Col>
                      </Row>
                    </>
                  ))}
                </Col>

                <div className="d-grid gap-3 mt-3 mb-4">
                  <Button>Lägg till produkter i varukorg</Button>
                </div>
              </>
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
