// import { useShoppingList } from "../hooks/useShoppingList";
import { Form, Button, ListGroup, Row, Col, FormLabel } from "react-bootstrap";
import { useState } from "react";

ShoppingListPage.route = {
  path: "/shoppingList",
  menuLabel: "Shopping List",
  index: 4,
  protected: true,
};

export default function ShoppingListPage() {
  ////////////////////////////////////////
  // MOCK UNTIL PROPER DB IS IMPLEMENTED//
  ////////////////////////////////////////

  // export interface ShoppingItem {
  //   id: number;
  //   userId: number;
  //   ingredient: string;
  //   checked: boolean;
  // }

  function useShoppingListMock() {
    const [items, setItems] = useState([
      { id: "1", ingredient: "Eggs", checked: false, unit: "g", amount: "500" },
      {
        id: "2",
        ingredient: "Milk",
        checked: true,
        unit: "ml",
        amount: "1000",
      },
    ]);

    const addItem = async (ingredient: string) => {
      setItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          ingredient,
          checked: false,
          unit: "",
          amount: "",
        },
      ]);
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleItemChecked = (id: string, checked: boolean) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked } : item))
      );
    };

    const fetchList = async () => {}; // no-op for mock

    return { items, addItem, removeItem, toggleItemChecked, fetchList };
  }

  const { items, addItem, removeItem, toggleItemChecked, fetchList } =
    /////////////////////////////////////////////////
    //Change this to useShoppingList when done mocking
    /////////////////////////////////////////////////
    useShoppingListMock();

  const [newItem, setNewItem] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    await fetchList();
    setNewItem("");
  }

  return (
    <Row className="mt-5 p-3 p-xl-5">
      <Col className="mt-4 mx-xl-5 px-xl-5">
        <h2>Shopping List</h2>

        {/* <Form onSubmit={handleAdd}>
          <Form.Group>
            <Form.Control
              placeholder="Add ingredient..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
          </Form.Group>


          <Button variant="success" type="submit" className="ms-2">
            Add
          </Button>
        </Form> */}

        <Form>
          <Row className="mt-4">
            <Col xs={12} xl={7} className="mb-2">
              <Form.Group>
                <Form.Control placeholder="Add ingredient..."></Form.Control>
              </Form.Group>
            </Col>
            <Col xs={6} xl={3} className="mb-2">
              <Form.Group>
                <Form.Control
                  placeholder="Add amount..."
                  type="text"
                ></Form.Control>
              </Form.Group>
            </Col>

            <Col xs={6} xl={1}>
              <Form.Control placeholder="Unit..." disabled></Form.Control>
            </Col>
            <Col xs={12} xl={1}>
              <div className="d-grid gap-2 mb-4 mb-xl-5">
                <Button variant="success" type="submit" className="w-auto">
                  Add
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        <ListGroup>
          {items.map((item) => (
            <ListGroup.Item
              key={item.id}
              className="d-flex align-items-center justify-content-between"
            >
              <Form.Check
                id={`check-${item.id}`}
                type="checkbox"
                checked={item.checked}
                onChange={(e) => toggleItemChecked(item.id, e.target.checked)}
                label={
                  <>
                    {item.ingredient}
                    <span className="ms-1">{item.amount}</span>
                    <span className="ms-1">{item.unit}</span>
                  </>
                }
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
