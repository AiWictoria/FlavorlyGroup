import { useShoppingList } from "../hooks/useShoppingList";
import { Form, Button, Row, Col, Table, Dropdown } from "react-bootstrap";
import { useState, useEffect } from "react";
import QuantitySelector from "../components/QuantitySelector";
import IngredientSearch, {
  type Ingredient,
} from "../components/shoppingList/IngredientSearch.tsx";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Shopping List",
  index: 4,
  protected: true,
};

export interface ShoppingItem {
  id: number;
  userId: number;
  ingredient: string;
  checked: boolean;
  product?: string;
  amount: number;
}

export default function ShoppingListPage() {
  const { items, addItem, removeItem, toggleItemChecked, fetchList } =
    useShoppingList();
  const [newItem, setNewItem] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    await fetchList();
    setNewItem("");
  }

  function moveItemsToCart() {
    // TODO: implement moving items to cart
  }

  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  return (
    <Row className="p-3 p-xl-5">
      <Col className="mt-4 mx-xl-5 px-xl-5">
        <h2>Shopping List</h2>
        <Form onSubmit={handleAdd}>
          <Row className="mt-4">
            <Col xs={12} xl={7} className="mb-2">
              <Form.Group>
                <IngredientSearch
                  onSelect={(ingredient) => setSelectedIngredient(ingredient)}
                />
              </Form.Group>
            </Col>
            <Col xs={6} xl={3} className="mb-2">
              <Form.Group>
                <Form.Control
                  placeholder="Add amount..."
                  type="number"
                  onChange={(e) => setNewItem(e.target.value)}
                ></Form.Control>
              </Form.Group>
            </Col>

            <Col xs={6} xl={1}>
              <Form.Control
                placeholder="Unit"
                disabled
                value={selectedIngredient?.unit.title ?? ""}
              />
            </Col>
            <Col xs={12} xl={1}>
              <div className="d-grid gap-2 mb-5">
                <Button variant="success" type="submit" className="w-auto">
                  Add
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {items.length > 0 ? (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: "1%" }}></th>
                  <th>Ingredient</th>
                  <th>Product</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr>
                    <td>
                      <Form.Check
                        id={`check-${item.id}`}
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) =>
                          toggleItemChecked(item.id, e.target.checked)
                        }
                      ></Form.Check>
                    </td>
                    <td>
                      {item.ingredient}
                      {/* {item.amount} {item.unit} */}
                    </td>
                    <td>
                      <Form.Select size="sm">
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

            <div className="d-grid gap-2">
              <Button onClick={() => moveItemsToCart()}>
                Add products to cart
              </Button>
            </div>
          </>
        ) : (
          <div
            className="d-flex justify-content-center align-items-center mt-5"
            style={{ color: "#9b9d9eff" }}
          >
            <h1>Shopping list is empty...</h1>
          </div>
        )}
      </Col>
    </Row>
  );
}
