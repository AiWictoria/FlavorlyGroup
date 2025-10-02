import { useShoppingList } from "../hooks/useShoppingList";
import { Form, Button, ListGroup, Row, Col } from "react-bootstrap";
import { useState } from "react";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Shopping List",
  index: 4,
  protected: true,
};

export default function ShoppingListPage() {
  const { items, addItem, editItem, removeItem, fetchList } = useShoppingList();
  const [newItem, setNewItem] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    await fetchList();
    setNewItem("");
  }

  return (
    <Row className="mt-5 p-5">
      <Col className="mt-4 mx-md-5 px-md-5">
        <h2>Shopping List</h2>

        <Form onSubmit={handleAdd} className="d-flex my-3">
          <Form.Control
            placeholder="Add ingredient..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <Button variant="success" type="submit" className="ms-2">
            Add
          </Button>
        </Form>

        <ListGroup>
          {items.map((item) => (
            <ListGroup.Item
              key={item.id}
              className="d-flex align-items-center justify-content-between"
            >
              <Form.Check
                type="checkbox"
                checked={item.checked}
                onChange={(e) => editItem(item.id, e.target.checked)}
                label={item.ingredient}
              />
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                -
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
    </Row>
  );
}
