import { useShoppingList } from "../hooks/useShoppingList";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import QuantitySelector from "../components/QuantitySelector";
import Box from "../components/orderReceipt/Box.tsx";

import IngredientSearch, {
  type Ingredient,
} from "../components/shoppingList/IngredientSearch";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Shopping List",
  index: 4,
  protected: true,
};

interface ShoppingItem {
  id: string;
  shoppingItemIngredient: Ingredient;
  checked: boolean;
}

export default function ShoppingListPage() {
  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);

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
      shoppingItemIngredient: updatedIngredient,
      checked: true,
    };

    setShoppingList((prevList) => [...prevList, newShoppingItem]);
  }

  return (
    <Box size="l" className="custom-class">
      <Row className="p-0">
        <Col className="mt-4 mx-xl-5">
          <h2>Shopping List</h2>
          <Form onSubmit={handleAdd}>
            <Row className="mt-4">
              <Col xs={12} xl={4} className="mb-2">
                <Form.Group>
                  <IngredientSearch
                    onIngredientChange={(ingredient) =>
                      setSelectedIngredient(ingredient)
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} xl={4} className="mb-2">
                <Form.Group>
                  <Form.Control
                    placeholder="Add amount..."
                    value={amount}
                    type="number"
                    min={1}
                    max={99}
                    step="any"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} xl={2}>
                <Form.Control
                  placeholder="Unit"
                  disabled
                  value={selectedIngredient?.unit.title ?? ""}
                />
              </Col>
              <Col xs={12} xl={2}>
                <div className="d-grid gap-2 mb-5">
                  <Button variant="success" type="submit" className="w-auto">
                    Add ingredient
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>

          {shoppingList.length > 0 ? (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Product</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {shoppingList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.shoppingItemIngredient.title}{" "}
                        {item.shoppingItemIngredient.amount}{" "}
                        {item.shoppingItemIngredient.unit.title}
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={product}
                          onChange={(e) => setProduct(e.target.value)}
                        >
                          <option></option>
                          <option>Cherry Tomatoes 500g</option>
                          <option>Roma Tomatoes 1kg</option>
                        </Form.Select>
                      </td>
                      <td>
                        <QuantitySelector value={1}></QuantitySelector>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Row
                className="mb-5 mt-5 p-1 m-1"
                style={{
                  backgroundColor: "#f2f2f2",
                }}
              >
                {shoppingList.map((item) => (
                  <>
                    <Col xs={12} lg={4}>
                      <span>
                        <b>Ingredient:</b>{" "}
                      </span>
                      {item.shoppingItemIngredient.title}{" "}
                      {item.shoppingItemIngredient.amount}{" "}
                      {item.shoppingItemIngredient.unit.title}{" "}
                    </Col>
                    <Col xs={12} lg={4} className="mt-1">
                      <Form.Select
                        size="sm"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                      >
                        <option value="">Choose product</option>
                        <option>Cherry Tomatoes 500g</option>
                        <option>Roma Tomatoes 1kg</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} lg={4} className="mt-1">
                      <b>Product:</b> {product}
                    </Col>
                  </>
                ))}
              </Row>

              <div className="d-grid gap-3 mt-3 mb-4">
                <Button>Add products to cart</Button>
              </div>
            </>
          ) : (
            <div
              className="d-flex justify-content-center align-items-center mt-5 mb-5"
              style={{ color: "#9b9d9eff" }}
            >
              <h1>Shopping list is empty...</h1>
            </div>
          )}
        </Col>
      </Row>
    </Box>
  );
}
